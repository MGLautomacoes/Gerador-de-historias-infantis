import React, { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';
import { ProductionPlan, Scene, User, NewCharacterPayload } from './types';
// FIX: Corrected typo from BIBLIoteca_PERSONAGENS to BIBLIOTECA_PERSONAGENS.
import { BIBLIOTECA_PERSONAGENS, PREDEFINED_CHARACTERS as INITIAL_PREDEFINED_CHARACTERS, LANGUAGES, TARGET_AUDIENCES } from './constants';
import { generateProductionPlan, generateImageFromText, generateImageFromTextAndImage, generateVideoFromImageAndText } from './services/geminiService';
import { generateVideoWithOpenAI } from './services/openaiService';
import CharacterSelector from './components/CharacterSelector';
import ProductionPlanView from './components/ProductionPlanView';
import { LanguagesIcon, ZapIcon, WandSparklesIcon, TargetIcon, UsersIcon, StarIcon, UserPlusIcon, MailIcon, ChevronDownIcon, PlusSquareIcon, PlayCircleIcon, OpenAIIcon, KidsStoriesLogo } from './components/icons';
import CharacterCreatorModal from './components/CharacterCreatorModal';
import AllCharactersViewModal from './components/AllCharactersViewModal';
import CreateUserModal from './components/CreateUserModal';
import InviteUserModal from './components/InviteUserModal';
import N8NWebhookManager from './components/N8NWebhookManager';
import { saasService } from './services/authService';
import { supabase, supabaseInitializationError } from './services/supabase';
// FIX: Import Session type from @supabase/auth-js to fix type resolution issues.
import { Session } from '@supabase/auth-js';
import { webhookService } from './services/webhookService';

// ==================================================================================
// 1. AUTHENTICATION CONTEXT & PROVIDER
// ==================================================================================

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, phone: string, ddi: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => void;
    isPasswordRecovery: boolean;
    clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        const handleAuthChange = async (session: Session | null) => {
            setLoading(true);
            try {
                if (session?.user) {
                    const profile = await saasService.getProfileForUser(session.user.id);
                    if (profile) {
                        setUser({
                            id: session.user.id,
                            email: session.user.email!,
                            role: profile.role,
                            status: profile.status,
                            phone: profile.phone,
                            ddi: profile.ddi,
                        });
                    } else {
                        console.warn("User is authenticated but no profile was found. User needs a profile in the DB to proceed.");
                        setUser(null);
                        await saasService.logout();
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Failed to handle auth change:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthChange(session);
        });
        
        const { data: { subscription } } = saasService.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
                setLoading(false);
            } else {
                handleAuthChange(session);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const value = { 
        user, 
        loading, 
        login: saasService.login, 
        signup: saasService.signup, 
        logout: saasService.logout,
        loginWithGoogle: saasService.loginWithGoogle,
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ==================================================================================
// 2. UI & PAGE COMPONENTS
// ==================================================================================

const Spinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
    </div>
);

const PendingActivationPage: React.FC = () => {
    const { logout } = useAuth();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center p-4">
            <KidsStoriesLogo className="h-24 w-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Conta Pendente de Ativação</h1>
            <p className="text-gray-400 max-w-md mb-8">
                Sua conta foi criada com sucesso, mas precisa ser ativada por um administrador. Por favor, aguarde. Você receberá um e-mail quando sua conta for ativada.
            </p>
            <button
                onClick={logout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
                Voltar ao Login
            </button>
        </div>
    );
};

const OrchestratorPage: React.FC = () => {
    const { logout } = useAuth();
    const [storyIdea, setStoryIdea] = useState<string>('Davi, um jovem pastor, se prepara para enfrentar o gigante Golias com sua fé e uma simples funda.');
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>(['Davi (Jovem)', 'Deus (Luz Divina)']);
    const [language, setLanguage] = useState<string>('Português (Brasil)');
    const [targetAudience, setTargetAudience] = useState<string>('Infantil de 6 a 10 anos');
    const [productionPlan, setProductionPlan] = useState<ProductionPlan | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [limitError, setLimitError] = useState<boolean>(false);
    const [characterImageCache, setCharacterImageCache] = useState<{ [key: string]: string }>({});
    const [characterPortraits, setCharacterPortraits] = useState<{ [key: string]: string }>({});
    const [characterLibrary, setCharacterLibrary] = useState(BIBLIOTECA_PERSONAGENS);
    const [predefinedCharacters, setPredefinedCharacters] = useState(INITIAL_PREDEFINED_CHARACTERS);
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    
    const [animateScenes, setAnimateScenes] = useState<boolean>(false);
    const [animationProvider, setAnimationProvider] = useState<'gemini' | 'openai'>('gemini');
    const [openAiApiKey, setOpenAiApiKey] = useState<string>('');
    const [needsApiKeySelection, setNeedsApiKeySelection] = useState<boolean>(false);

    const API_DELAY_MS = 1200;

    // Load state from sessionStorage on mount to persist across reloads/tab switches
    useEffect(() => {
        try {
            const savedPlan = sessionStorage.getItem('productionPlan');
            const savedPortraits = sessionStorage.getItem('characterPortraits');

            if (savedPlan) {
                setProductionPlan(JSON.parse(savedPlan));
            }
            if (savedPortraits) {
                setCharacterPortraits(JSON.parse(savedPortraits));
            }
        } catch (e) {
            console.error("Failed to load state from sessionStorage", e);
            sessionStorage.removeItem('productionPlan');
            sessionStorage.removeItem('characterPortraits');
        }
    }, []);

    // Save state to sessionStorage on change
    useEffect(() => {
        try {
            if (productionPlan) {
                sessionStorage.setItem('productionPlan', JSON.stringify(productionPlan));
            } else {
                sessionStorage.removeItem('productionPlan');
            }
        } catch (e) {
            console.error("Failed to save production plan to sessionStorage", e);
        }
    }, [productionPlan]);

    useEffect(() => {
        try {
            if (Object.keys(characterPortraits).length > 0) {
                sessionStorage.setItem('characterPortraits', JSON.stringify(characterPortraits));
            } else {
                sessionStorage.removeItem('characterPortraits');
            }
        } catch (e) {
            console.error("Failed to save character portraits to sessionStorage", e);
        }
    }, [characterPortraits]);

    useEffect(() => {
        try {
            const savedChars = localStorage.getItem('customCharacters');
            if (savedChars) {
                const customChars = JSON.parse(savedChars);
                setCharacterLibrary(prev => ({ ...prev, ...customChars }));
            }
        } catch (e) {
            console.error("Failed to load custom characters from localStorage", e);
        }
    }, []);

    useEffect(() => {
        const allCharacterNames = Object.keys(characterLibrary).filter(key => key !== 'estilo_base');
        setPredefinedCharacters(allCharacterNames);
        const customChars: { [key: string]: string } = {};
        allCharacterNames.forEach(name => {
            if (!INITIAL_PREDEFINED_CHARACTERS.includes(name)) {
                customChars[name] = characterLibrary[name];
            }
        });
        try {
            if (Object.keys(customChars).length > 0) {
                localStorage.setItem('customCharacters', JSON.stringify(customChars));
            } else {
                 localStorage.removeItem('customCharacters');
            }
        } catch(e) {
             console.error("Failed to save custom characters to localStorage", e);
        }
    }, [characterLibrary]);

    const handleAddCustomCharacter = useCallback((payload: NewCharacterPayload) => {
        const { name, description, imageUrl } = payload;
        if (name && !characterLibrary[name]) {
            setCharacterLibrary(prev => ({ ...prev, [name]: description }));
            setSelectedCharacters(prev => [...new Set([...prev, name])]);
            setCharacterImageCache(prev => ({ ...prev, [name]: imageUrl }));
            setIsCreatorModalOpen(false);
        }
    }, [characterLibrary]);

    const handleDeleteCustomCharacter = useCallback((name: string) => {
        if (INITIAL_PREDEFINED_CHARACTERS.includes(name)) return;
        setCharacterLibrary(prev => {
            const newLib = { ...prev };
            delete newLib[name];
            return newLib;
        });
        setSelectedCharacters(prev => prev.filter(c => c !== name));
        setCharacterImageCache(prev => {
            const newCache = { ...prev };
            delete newCache[name];
            return newCache;
        });
    }, []);

    const handleCreateNewStory = () => {
        setProductionPlan(null);
        setCharacterPortraits({});
        setError(null);
        setLimitError(false);
        setLoadingMessage('');
    };
    
    const handleSelectApiKey = async () => {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setNeedsApiKeySelection(false);
        setError(null);
        // Resubmit the form after key selection
        handleSubmit(new Event('submit') as unknown as React.FormEvent);
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storyIdea || selectedCharacters.length === 0) {
            setError('Por favor, forneça uma ideia de história e selecione pelo menos um personagem.');
            return;
        }

        setError(null);
        setLimitError(false);
        setNeedsApiKeySelection(false);

        // --- API KEY CHECKING LOGIC ---
        if (animateScenes && animationProvider === 'gemini') {
            // Case 1: Video with Gemini. Use the studio key for everything.
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setError('Para animar com Gemini, selecione uma Chave de API com faturamento ativado.');
                setNeedsApiKeySelection(true);
                return; // Stop, let user click the button to select a key.
            }
        } else {
            // Case 2: No Gemini video. Check for the .env.local key for text/images.
            if (!import.meta.env.VITE_API_KEY) {
                setError('Para gerar roteiro e imagens, por favor, configure sua VITE_API_KEY no arquivo .env.local.');
                return;
            }
            // Also check for OpenAI key if that's the selected provider for animation
            if (animateScenes && animationProvider === 'openai' && !openAiApiKey) {
                setError('Por favor, insira sua chave de API da OpenAI para animar as cenas.');
                return;
            }
        }
        
        setProductionPlan(null);

        try {
            setLoadingMessage('Criando retratos dos personagens...');
            const predefinedSelected = selectedCharacters.filter(c => predefinedCharacters.includes(c));
            const portraits: { [key: string]: string } = {};
            for (const charName of predefinedSelected) {
                if (characterImageCache[charName]) {
                    portraits[charName] = characterImageCache[charName];
                    continue;
                }
                setLoadingMessage(`Criando retrato: ${charName}...`);
                const portraitPrompt = `${characterLibrary[charName]}, character portrait, ${characterLibrary.estilo_base}, simple background`;
                const imageUrl = await generateImageFromText(portraitPrompt);
                portraits[charName] = imageUrl;
                setCharacterImageCache(prev => ({...prev, [charName]: imageUrl }));
                await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
            }
            setCharacterPortraits(portraits);

            setLoadingMessage('Gerando roteiro e thumbnails...');
            const rawJsonResponse = await generateProductionPlan(storyIdea, characterLibrary, language, targetAudience);
            let plan: ProductionPlan = JSON.parse(rawJsonResponse);
            
            if (plan.youtube_thumbnail) {
                setLoadingMessage('Gerando thumbnail 16:9...');
                const thumb169 = await generateImageFromText(`${plan.youtube_thumbnail.prompt_16_9}, ${characterLibrary.estilo_base}`);
                plan.youtube_thumbnail.imageUrl_16_9 = thumb169;

                setLoadingMessage('Gerando thumbnail 9:16...');
                const thumb916 = await generateImageFromText(`${plan.youtube_thumbnail.prompt_9_16}, ${characterLibrary.estilo_base}`);
                plan.youtube_thumbnail.imageUrl_9_16 = thumb916;
            }

            const planWithIds: ProductionPlan = { ...plan, cenas: plan.cenas.map((cena, index) => ({ ...cena, id: index + 1, isGenerating: true })) };
            setProductionPlan(planWithIds);

            let imagePlan = planWithIds;
            const descricoesParaUsar: { [key: string]: string } = {};
            selectedCharacters.forEach(nome => {
                if (characterLibrary[nome]) { descricoesParaUsar[nome] = characterLibrary[nome]; }
            });

            for (const scene of imagePlan.cenas) {
                setLoadingMessage(`Gerando imagem para a Cena ${scene.id}...`);
                let finalImagePrompt = scene.prompt_imagem;
                const charactersInScene = predefinedSelected.filter(char => finalImagePrompt.includes(`[${char}]`));
                const referenceImageUrls = charactersInScene.map(char => portraits[char]).filter(Boolean);
                let imageUrl: string;
                if (referenceImageUrls.length > 0) {
                    let scenePrompt = finalImagePrompt;
                    charactersInScene.forEach((charName, index) => {
                        const placeholder = new RegExp(`\\[${charName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                        scenePrompt = scenePrompt.replace(placeholder, `(person ${index + 1})`);
                    });
                    for (const [nome, desc] of Object.entries(descricoesParaUsar)) {
                        if (!charactersInScene.includes(nome)) {
                           const placeholder = new RegExp(`\\[${nome.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                           scenePrompt = scenePrompt.replace(placeholder, `(${desc})`);
                        }
                    }
                    imageUrl = await generateImageFromTextAndImage(`${scenePrompt}, ${characterLibrary.estilo_base}`, referenceImageUrls);
                } else {
                    for (const [nome, desc] of Object.entries(descricoesParaUsar)) {
                        const placeholder = new RegExp(`\\[${nome.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                        finalImagePrompt = finalImagePrompt.replace(placeholder, `(${desc})`);
                    }
                    imageUrl = await generateImageFromText(`${finalImagePrompt}, ${characterLibrary.estilo_base}`);
                }
                
                imagePlan = { ...imagePlan, cenas: imagePlan.cenas.map(s => s.id === scene.id ? { ...s, imageUrl, isGenerating: false } : s) };
                setProductionPlan(imagePlan);
                
                if (animateScenes) {
                    setLoadingMessage(`Animando Cena ${scene.id}... (pode levar alguns minutos)`);
                    imagePlan = { ...imagePlan, cenas: imagePlan.cenas.map(s => s.id === scene.id ? { ...s, isAnimating: true } : s) };
                    setProductionPlan(imagePlan);
                    try {
                        let videoUrl: string;
                        if (animationProvider === 'openai') {
                             videoUrl = await generateVideoWithOpenAI(scene.prompt_diretor, imageUrl, openAiApiKey);
                        } else {
                             videoUrl = await generateVideoFromImageAndText(scene.prompt_diretor, imageUrl);
                        }
                        imagePlan = { ...imagePlan, cenas: imagePlan.cenas.map(s => s.id === scene.id ? { ...s, videoUrl, isAnimating: false } : s) };
                        setProductionPlan(imagePlan);
                    } catch (videoError) {
                         console.error(`Falha ao animar cena ${scene.id}:`, videoError);
                         throw videoError;
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
            }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            if (errorMessage.toLowerCase().includes('limit')) {
                setLimitError(true);
            } else if (errorMessage.includes('Requested entity was not found')) {
                setError("Chave de API inválida ou sem permissão para o modelo de vídeo. Por favor, selecione uma chave de API válida com um projeto faturável.");
                setNeedsApiKeySelection(true);
            }
            else {
                setError(errorMessage);
            }
        } finally {
            setLoadingMessage('');
        }
    }, [storyIdea, selectedCharacters, language, targetAudience, characterImageCache, characterLibrary, predefinedCharacters, animateScenes, animationProvider, openAiApiKey]);

    const handleUpdateScene = useCallback((updatedScene: Scene) => {
        setProductionPlan(prevPlan => {
            if (!prevPlan) return null;
            return { ...prevPlan, cenas: prevPlan.cenas.map(scene => scene.id === updatedScene.id ? updatedScene : scene) };
        });
    }, []);

    const handleRegenerateScene = useCallback(async (sceneId: number) => {
        if (!productionPlan) return;
        const sceneToRegenerate = productionPlan.cenas.find(s => s.id === sceneId);
        if (!sceneToRegenerate) return;
        setError(null);
        setLimitError(false);
        setProductionPlan(prev => prev ? { ...prev, cenas: prev.cenas.map(s => s.id === sceneId ? { ...s, isGenerating: true } : s) } : null);
        try {
            let finalImagePrompt = sceneToRegenerate.prompt_imagem;
            const predefinedSelected = Object.keys(characterPortraits);
            const charactersInScene = predefinedSelected.filter(char => finalImagePrompt.includes(`[${char}]`));
            const referenceImageUrls = charactersInScene.map(char => characterPortraits[char]).filter(Boolean);
            let imageUrl: string;
            const descricoesParaUsar: { [key: string]: string } = {};
            selectedCharacters.forEach(nome => { descricoesParaUsar[nome] = characterLibrary[nome]; });
            if (referenceImageUrls.length > 0) {
                let scenePrompt = finalImagePrompt;
                charactersInScene.forEach((charName, index) => {
                    const placeholder = new RegExp(`\\[${charName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                    scenePrompt = scenePrompt.replace(placeholder, `(person ${index + 1})`);
                });
                for (const [nome, desc] of Object.entries(descricoesParaUsar)) {
                     if (!charactersInScene.includes(nome)) {
                        const placeholder = new RegExp(`\\[${nome.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                        scenePrompt = scenePrompt.replace(placeholder, `(${desc})`);
                     }
                }
                imageUrl = await generateImageFromTextAndImage(`${scenePrompt}, ${characterLibrary.estilo_base}`, referenceImageUrls);
            } else {
                for (const [nome, desc] of Object.entries(descricoesParaUsar)) {
                    const placeholder = new RegExp(`\\[${nome.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\]`, 'g');
                    finalImagePrompt = finalImagePrompt.replace(placeholder, `(${desc})`);
                }
                imageUrl = await generateImageFromText(`${finalImagePrompt}, ${characterLibrary.estilo_base}`);
            }
             setProductionPlan(prev => prev ? { ...prev, cenas: prev.cenas.map(s => s.id === sceneId ? { ...s, imageUrl, isGenerating: false } : s) } : null);
             await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : `Falha ao regenerar a imagem para a Cena ${sceneId}.`;
             if (errorMessage.toLowerCase().includes('limit')) {
                setLimitError(true);
            } else {
                setError(errorMessage);
            }
            setProductionPlan(prev => prev ? { ...prev, cenas: prev.cenas.map(s => s.id === sceneId ? { ...s, isGenerating: false } : s) } : null);
        }
    }, [productionPlan, characterPortraits, selectedCharacters, characterLibrary]);

    const handleRegenerateThumbnail = useCallback(async (aspectRatio: '16:9' | '9:16') => {
        if (!productionPlan?.youtube_thumbnail) return;
        setError(null);
        setLimitError(false);

        const prompt = aspectRatio === '16:9'
            ? productionPlan.youtube_thumbnail.prompt_16_9
            : productionPlan.youtube_thumbnail.prompt_9_16;
        const isGeneratingKey = aspectRatio === '16:9' ? 'isGenerating_16_9' : 'isGenerating_9_16';
        const imageUrlKey = aspectRatio === '16:9' ? 'imageUrl_16_9' : 'imageUrl_9_16';

        setProductionPlan(prev => prev ? { ...prev, youtube_thumbnail: { ...prev.youtube_thumbnail!, [isGeneratingKey]: true } } : null);
        try {
            const imageUrl = await generateImageFromText(`${prompt}, ${characterLibrary.estilo_base}`);
            setProductionPlan(prev => prev ? { ...prev, youtube_thumbnail: { ...prev.youtube_thumbnail!, [imageUrlKey]: imageUrl, [isGeneratingKey]: false } } : null);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : `Falha ao regenerar a thumbnail ${aspectRatio}.`;
            if (errorMessage.toLowerCase().includes('limit')) { setLimitError(true); } else { setError(errorMessage); }
            setProductionPlan(prev => prev ? { ...prev, youtube_thumbnail: { ...prev.youtube_thumbnail!, [isGeneratingKey]: false } } : null);
        }
    }, [productionPlan, characterLibrary]);


    return (
        <>
            {isCreatorModalOpen && <CharacterCreatorModal onClose={() => setIsCreatorModalOpen(false)} onSave={handleAddCustomCharacter} existingNames={predefinedCharacters} />}
            {isViewAllModalOpen && <AllCharactersViewModal onClose={() => setIsViewAllModalOpen(false)} characterLibrary={characterLibrary} cache={characterImageCache} setCache={setCharacterImageCache} />}
            <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
                <aside className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 p-6 bg-gray-900 border-r border-gray-700/50 flex flex-col space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <KidsStoriesLogo className="h-12 w-auto" />
                            <h1 className="text-2xl font-bold text-white">Orquestrador</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            {productionPlan && (
                                <button onClick={handleCreateNewStory} title="Nova História" className="text-gray-400 hover:text-white transition-colors">
                                    <PlusSquareIcon className="h-6 w-6" />
                                </button>
                            )}
                            <button onClick={logout} title="Sair" className="text-gray-400 hover:text-white transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-6">
                        <div>
                            <label htmlFor="story-idea" className="block text-sm font-medium text-gray-300 mb-2">1. Ideia da História</label>
                            <textarea id="story-idea" rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200" placeholder="Ex: A história de Jonas e a baleia." value={storyIdea} onChange={(e) => setStoryIdea(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">2. Público-Alvo</label>
                            <div className="relative">
                                <TargetIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select id="target-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200">
                                    {TARGET_AUDIENCES.map(audience => (<option key={audience.value} value={audience.value}>{audience.label}</option>))}
                                </select>
                            </div>
                        </div>
                        <CharacterSelector selectedCharacters={selectedCharacters} setSelectedCharacters={setSelectedCharacters} characterImageCache={characterImageCache} setCharacterImageCache={setCharacterImageCache} predefinedCharacters={predefinedCharacters} onOpenCreatorModal={() => setIsCreatorModalOpen(true)} onOpenViewAllModal={() => setIsViewAllModalOpen(true)} onDeleteCustomCharacter={handleDeleteCustomCharacter} />
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">4. Idioma do Roteiro</label>
                            <div className="relative">
                                <LanguagesIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full appearance-none bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200">
                                    {LANGUAGES.map(lang => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="flex-grow"></div>

                        <div className="pt-4 border-t border-gray-700/50 space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="animate-scenes"
                                    checked={animateScenes}
                                    onChange={(e) => setAnimateScenes(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="flex items-center text-sm font-medium text-gray-200">
                                    <PlayCircleIcon className="h-5 w-5 mr-2 text-indigo-400"/>
                                    ✨ Animar Cenas
                                </span>
                            </label>
                            
                            {animateScenes && (
                                <div className="pl-8 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-2">Provedor de Animação</label>
                                        <div className="flex bg-gray-800 rounded-lg p-1">
                                            <button type="button" onClick={() => setAnimationProvider('gemini')} className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center transition-colors ${animationProvider === 'gemini' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-gray-700/50'}`}>
                                                <WandSparklesIcon className="h-4 w-4 mr-1.5" />
                                                Gemini Veo
                                            </button>
                                            <button type="button" onClick={() => setAnimationProvider('openai')} className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center transition-colors ${animationProvider === 'openai' ? 'bg-gray-600 text-white shadow' : 'hover:bg-gray-700/50'}`}>
                                                <OpenAIIcon className="h-4 w-4 mr-1.5" />
                                                OpenAI
                                            </button>
                                        </div>
                                    </div>

                                    {animationProvider === 'openai' && (
                                        <div>
                                            <label htmlFor="openai-key" className="block text-xs font-medium text-gray-400 mb-2">Chave de API OpenAI</label>
                                            <input
                                                type="password"
                                                id="openai-key"
                                                value={openAiApiKey}
                                                onChange={(e) => setOpenAiApiKey(e.target.value)}
                                                placeholder="sk-..."
                                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">
                                                Sua chave não é armazenada. A API de vídeo da OpenAI (Sora) pode não estar publicamente disponível.
                                            </p>
                                        </div>
                                    )}
                                    
                                    <p className="text-xs text-gray-500">
                                        A animação aumenta o tempo de processamento e pode incorrer em custos com o provedor de API selecionado.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {needsApiKeySelection && (
                             <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg">
                                <p className="text-sm font-bold mb-2">Ação Necessária para Animação</p>
                                <p className="text-xs mb-3">{error}</p>
                                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 hover:underline mb-3 block">Saiba mais sobre o faturamento.</a>
                                <button
                                    type="button"
                                    onClick={handleSelectApiKey}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors"
                                >
                                    Selecionar Chave de API
                                </button>
                            </div>
                        )}

                        <button type="submit" disabled={!!loadingMessage} className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-indigo-900/50">
                            {loadingMessage ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{loadingMessage}</>) : (<><ZapIcon className="h-5 w-5 mr-2" />Dê vida à sua imaginação</>)}
                        </button>
                    </form>
                </aside>
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {error && !needsApiKeySelection && (<div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert"><strong className="font-bold">Erro: </strong><span className="block sm:inline">{error}</span></div>)}
                    {limitError && (<div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-4 rounded-lg mb-6 flex items-center justify-between" role="alert"><div className='flex items-center'><StarIcon className="h-6 w-6 mr-3 text-yellow-400" /><div><strong className="font-bold">Limite de Gerações Atingido!</strong><p className="text-sm">Você usou todas as suas gerações gratuitas deste mês.</p></div></div><button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-shrink-0">Fazer Upgrade</button></div>)}
                    <ProductionPlanView 
                        plan={productionPlan} 
                        isLoading={!!loadingMessage} 
                        onUpdateScene={handleUpdateScene} 
                        onRegenerateScene={handleRegenerateScene}
                        onRegenerateThumbnail={handleRegenerateThumbnail}
                    />
                </main>
            </div>
        </>
    );
};

const AdminDashboard: React.FC = () => {
    const { logout, user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
    const [isAddUserDropdownOpen, setIsAddUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await saasService.getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsAddUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleToggleStatus = async (userToUpdate: User) => {
        const newStatus = userToUpdate.status === 'active' ? 'inactive' : 'active';
        await saasService.updateUserStatus(userToUpdate.id, newStatus);
        
        // --- Webhook Call ---
        const event = newStatus === 'active' ? 'user.activated' : 'user.deactivated';
        await webhookService.sendWebhook(event, userToUpdate);
        // --- End Webhook Call ---

        fetchUsers();
    };

    return (
        <>
        <CreateUserModal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} onUserAdded={fetchUsers} />
        <InviteUserModal isOpen={isInviteUserModalOpen} onClose={() => setIsInviteUserModalOpen(false)} onUserInvited={fetchUsers} />
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <header className="flex justify-between items-center mb-8 pb-6 border-b border-gray-700/50 flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                    <UsersIcon className="h-8 w-8 text-indigo-400" /><h1 className="text-3xl font-bold text-white">Painel Super Admin</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400 hidden sm:block">{user?.email}</span>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsAddUserDropdownOpen(prev => !prev)} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Adicionar Usuário<ChevronDownIcon className={`h-5 w-5 ml-2 transition-transform ${isAddUserDropdownOpen ? 'rotate-180' : ''}`}/></button>
                        {isAddUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 border border-gray-700">
                                <div className="py-1">
                                    <button onClick={() => { setIsInviteUserModalOpen(true); setIsAddUserDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"><MailIcon className="h-5 w-5 mr-3" />Convidar por E-mail</button>
                                    {/* FIX: The file was truncated here. This button has been completed. */}
                                    <button onClick={() => { setIsCreateUserModalOpen(true); setIsAddUserDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50"><UserPlusIcon className="h-5 w-5 mr-3" />Criar com Senha</button>
                                </div>
                            </div>
                        )}
                    </div>
                     <button onClick={logout} title="Sair" className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>
            
            <main>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg shadow-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando usuários...</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-800 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{u.email}</div>
                                        <div className="text-sm text-gray-400">{u.phone ? `+${u.ddi} ${u.phone}` : 'Sem telefone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                                            {u.status === 'active' ? 'Ativo' : (u.status === 'inactive' ? 'Inativo' : 'Pendente')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleToggleStatus(u)} className={`font-bold py-1 px-3 rounded-md transition-colors text-xs ${u.status === 'active' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                                            {u.status === 'active' ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <N8NWebhookManager />
                </div>
            </main>
        </div>
        </>
    );
};

const LoginSignupPage: React.FC = () => {
    const { login, signup, loginWithGoogle } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [ddi, setDdi] = useState('55');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, phone, ddi);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <KidsStoriesLogo className="mx-auto h-24 w-auto" />
                    <h2 className="mt-4 text-3xl font-bold text-white">Bem-vindo(a)</h2>
                    <p className="mt-2 text-gray-400">{isLogin ? 'Faça login para continuar' : 'Crie sua conta para começar'}</p>
                </div>
                
                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-sm focus:ring-1 focus:ring-indigo-500 transition" />
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-sm focus:ring-1 focus:ring-indigo-500 transition" />
                    
                    {!isLogin && (
                        <div className="flex space-x-2">
                             <select value={ddi} onChange={e => setDdi(e.target.value)} className="bg-gray-900 border border-gray-600 rounded-md p-3 text-sm focus:ring-1 focus:ring-indigo-500 transition">
                                <option value="55">🇧🇷 +55</option>
                                <option value="1">🇺🇸 +1</option>
                                <option value="44">🇬🇧 +44</option>
                                <option value="34">🇪🇸 +34</option>
                            </select>
                            <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-sm focus:ring-1 focus:ring-indigo-500 transition" />
                        </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-600"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-800 text-gray-500">OU</span></div>
                </div>

                <button onClick={loginWithGoogle} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.132,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    Continuar com Google
                </button>
                
                <p className="text-center text-sm text-gray-400">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-400 hover:text-indigo-300 ml-1">
                        {isLogin ? 'Cadastre-se' : 'Faça login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const PasswordResetPage: React.FC = () => {
    const { clearPasswordRecovery } = useAuth();
    // This would typically involve a form to set a new password.
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center p-4">
            <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
            <p className="text-gray-400 max-w-md mb-8">
                Esta página seria usada para redefinir a senha.
            </p>
            <button
                onClick={clearPasswordRecovery}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
                Voltar ao Login
            </button>
        </div>
    );
};

const AppContent: React.FC = () => {
    const { user, loading, isPasswordRecovery } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    if (supabaseInitializationError) {
        return <div className="text-red-500 text-center p-8">{supabaseInitializationError}</div>;
    }
    
    if (isPasswordRecovery) {
        return <PasswordResetPage />;
    }

    if (!user) {
        return <LoginSignupPage />;
    }

    if (user.status === 'pending') {
        return <PendingActivationPage />;
    }

    if (user.role === 'superadmin') {
        return <AdminDashboard />;
    }

    return <OrchestratorPage />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;