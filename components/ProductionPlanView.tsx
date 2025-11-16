import React, { useState, useEffect } from 'react';
import { ProductionPlan, Scene, YouTubeThumbnail } from '../types';
import { FilmIcon, SparklesIcon, VideoCameraIcon, DialogueIcon, PhotoIcon, PencilIcon, RefreshCwIcon, CheckCircleIcon, XIcon, DownloadIcon, ClipboardIcon } from './icons';

interface ProductionPlanViewProps {
    plan: ProductionPlan | null;
    isLoading: boolean;
    onUpdateScene: (scene: Scene) => void;
    onRegenerateScene: (sceneId: number) => void;
    onRegenerateThumbnail: (aspectRatio: '16:9' | '9:16') => void;
}

const Placeholder: React.FC = () => (
    <div className="text-center py-20 px-6 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg">
        <SparklesIcon className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-4 text-lg font-semibold text-gray-400">Aguardando Plano de Produção</h3>
        <p className="mt-1 text-sm text-gray-500">
            Preencha os detalhes à esquerda e clique em "Gerar" para criar seu roteiro.
        </p>
    </div>
);

const InitialLoader: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded-md w-1/2"></div>
         <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-6 bg-gray-700 rounded w-full"></div>
        </div>
    </div>
);

const ThumbnailImage: React.FC<{
    aspectRatio: '16:9' | '9:16';
    imageUrl?: string;
    isGenerating?: boolean;
    onRegenerate: () => void;
}> = ({ aspectRatio, imageUrl, isGenerating, onRegenerate }) => {
    const aspectClass = aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]';
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-300">{aspectRatio === '16:9' ? 'Thumbnail (16:9)' : 'Shorts (9:16)'}</p>
                 <button onClick={onRegenerate} disabled={isGenerating} className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed p-1.5 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label={`Regerar thumbnail ${aspectRatio}`}>
                    {isGenerating ? <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <RefreshCwIcon className="h-4 w-4" />}
                </button>
            </div>
            <div className={`${aspectClass} w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden`}>
                {isGenerating ? (
                    <div className="flex flex-col items-center text-gray-500"><svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-2 text-xs">Gerando...</p></div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={`Thumbnail ${aspectRatio}`} className="w-full h-full object-cover" />
                ) : (
                    <PhotoIcon className="h-8 w-8 text-gray-500" />
                )}
            </div>
        </div>
    );
};

const ThumbnailCard: React.FC<{ thumbnail: YouTubeThumbnail; onRegenerate: (aspectRatio: '16:9' | '9:16') => void; }> = ({ thumbnail, onRegenerate }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(thumbnail.descricao_youtube);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg">
             <h3 className="text-xl font-semibold text-indigo-300 mb-6">Conteúdo para YouTube</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                     <ThumbnailImage aspectRatio="16:9" imageUrl={thumbnail.imageUrl_16_9} isGenerating={thumbnail.isGenerating_16_9} onRegenerate={() => onRegenerate('16:9')} />
                     <ThumbnailImage aspectRatio="9:16" imageUrl={thumbnail.imageUrl_9_16} isGenerating={thumbnail.isGenerating_9_16} onRegenerate={() => onRegenerate('9:16')} />
                </div>
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-300">Descrição e Hashtags</h4>
                        <button onClick={handleCopy} className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors disabled:text-gray-500" disabled={copied}>
                            {copied ? <CheckCircleIcon className="h-4 w-4 mr-1 text-green-400" /> : <ClipboardIcon className="h-4 w-4 mr-1" />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg text-gray-200 text-sm whitespace-pre-wrap h-full">{thumbnail.descricao_youtube}</div>
                </div>
             </div>
        </div>
    );
};

const SceneCard: React.FC<{ scene: Scene; index: number; onUpdateScene: (scene: Scene) => void; onRegenerateScene: (sceneId: number) => void; }> = ({ scene, index, onUpdateScene, onRegenerateScene }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableScene, setEditableScene] = useState<Scene>(scene);

    useEffect(() => {
        if (!isEditing) {
            setEditableScene(scene);
        }
    }, [scene, isEditing]);

    const handleInputChange = (field: keyof Omit<Scene, 'id' | 'imageUrl' | 'isGenerating'>, value: string) => {
        setEditableScene(prev => ({...prev, [field]: value}));
    };

    const handleSaveChanges = () => {
        onUpdateScene(editableScene);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableScene(scene);
        setIsEditing(false);
    };

    const handleRegenerateClick = () => {
        if (!scene.isGenerating) {
            onRegenerateScene(scene.id);
        }
    };
    
    return (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700/50 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-semibold text-indigo-300">Cena {index + 1}</h3>
                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleSaveChanges} className="text-green-400 hover:text-green-300 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Salvar alterações">
                                <CheckCircleIcon className="h-5 w-5" />
                            </button>
                             <button onClick={handleCancel} className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Cancelar edição">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleRegenerateClick} disabled={scene.isGenerating} className="text-indigo-400 hover:text-indigo-300 disabled:text-gray-500 disabled:cursor-not-allowed p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Regerar imagem da cena">
                                {scene.isGenerating ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <RefreshCwIcon className="h-5 w-5" />}
                            </button>
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors" aria-label="Editar cena">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="space-y-6">
                {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="font-semibold text-gray-300 text-sm mb-1 block">Diálogo / Narração</label>
                            <textarea value={editableScene.dialogo} onChange={(e) => handleInputChange('dialogo', e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"/>
                        </div>
                         <div>
                            <label className="font-semibold text-gray-300 text-sm mb-1 block">Prompt do Diretor</label>
                            <textarea value={editableScene.prompt_diretor} onChange={(e) => handleInputChange('prompt_diretor', e.target.value)} rows={5} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500"/>
                        </div>
                         <div>
                            <label className="font-semibold text-gray-300 text-sm mb-1 block">Prompt de Imagem Original</label>
                            <textarea value={editableScene.prompt_imagem} onChange={(e) => handleInputChange('prompt_imagem', e.target.value)} rows={2} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 font-mono text-sm focus:ring-1 focus:ring-indigo-500"/>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="aspect-video w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                            {scene.isGenerating ? (
                                <div className="flex flex-col items-center text-gray-500">
                                    <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-2 text-sm">Gerando imagem...</p>
                                    </div>
                            ) : scene.imageUrl ? (
                                    <img src={scene.imageUrl} alt={`Keyframe for scene ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                                <PhotoIcon className="h-10 w-10 text-gray-500" />
                            )}
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-start space-x-4">
                                <DialogueIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-gray-300">Diálogo / Narração</h4>
                                    <p className="text-gray-200">{scene.dialogo}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <VideoCameraIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-gray-300">Prompt do Diretor</h4>
                                    <p className="text-gray-200">{scene.prompt_diretor}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <PhotoIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-gray-300">Prompt de Imagem Original</h4>
                                    <p className="text-gray-400 text-sm font-mono">{scene.prompt_imagem}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                 {(scene.isAnimating || scene.videoUrl) && (
                    <div className="pt-6 border-t border-gray-700/50">
                         <div className="aspect-video w-full bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                            {scene.isAnimating ? (
                                <div className="flex flex-col items-center text-gray-400">
                                    <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-2 text-sm">Animando cena...</p>
                                    <p className="text-xs text-gray-500">(Isso pode levar alguns minutos)</p>
                                </div>
                            ) : scene.videoUrl ? (
                                <video src={scene.videoUrl} className="w-full h-full object-contain" controls autoPlay loop muted playsInline />
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductionPlanView: React.FC<ProductionPlanViewProps> = ({ plan, isLoading, onUpdateScene, onRegenerateScene, onRegenerateThumbnail }) => {
    if (isLoading && !plan) {
        return <InitialLoader />;
    }

    if (!plan) {
        return <Placeholder />;
    }
    
    const downloadJson = () => {
        // Create a copy of the plan and remove blob URLs before serializing
        const planForExport = JSON.parse(JSON.stringify(plan));
        planForExport.cenas.forEach((scene: Scene) => {
            delete scene.videoUrl; // Remove temporary blob URLs
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planForExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${plan.titulo.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };


    return (
        <div className="space-y-8">
             <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <div className="flex items-center space-x-3 min-w-0">
                    <FilmIcon className="h-8 w-8 text-indigo-400 flex-shrink-0" />
                    <h2 className="text-3xl font-bold text-white truncate">{plan.titulo}</h2>
                </div>
                <button
                    onClick={downloadJson}
                    className="flex-shrink-0 ml-4 flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span>Baixar JSON</span>
                </button>
            </div>

            {plan.youtube_thumbnail && (
                <ThumbnailCard
                    thumbnail={plan.youtube_thumbnail}
                    onRegenerate={onRegenerateThumbnail}
                />
            )}

            {plan.cenas.map((cena, index) => (
                <SceneCard 
                    key={cena.id} 
                    scene={cena} 
                    index={index} 
                    onUpdateScene={onUpdateScene}
                    onRegenerateScene={onRegenerateScene}
                />
            ))}
        </div>
    );
};

export default ProductionPlanView;