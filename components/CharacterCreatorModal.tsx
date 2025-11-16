import React, { useState, useCallback } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { BIBLIOTECA_PERSONAGENS } from '../constants';
import { WandSparklesIcon, ZapIcon } from './icons';
import { NewCharacterPayload } from '../types';

interface CharacterCreatorModalProps {
    onClose: () => void;
    onSave: (payload: NewCharacterPayload) => void;
    existingNames: string[];
}

const formLabelStyle = "block text-sm font-medium text-gray-300 mb-1";
const formInputStyle = "w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 transition";
const formSelectStyle = `${formInputStyle} appearance-none`;


const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({ onClose, onSave, existingNames }) => {
    const [formState, setFormState] = useState({
        name: '',
        body: 'magro',
        hairStyle: '',
        hairLength: 'curto',
        face: '',
        clothing: '',
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [description, setDescription] = useState('');

    const handleInputChange = (field: keyof typeof formState, value: string) => {
        setFormState(prev => ({...prev, [field]: value}));
        if (field === 'name') {
            if (existingNames.map(n => n.toLowerCase()).includes(value.trim().toLowerCase())) {
                setNameError('Este nome de personagem já existe.');
            } else {
                setNameError(null);
            }
        }
    };
    
    const buildDescription = useCallback(() => {
        const { name, body, hairStyle, hairLength, face, clothing } = formState;
        const parts = [
            `um(a) ${name.trim()} em estilo 3D cartoon`,
            body && `corpo ${body}`,
            hairStyle && `cabelo ${hairLength} ${hairStyle}`,
            face,
            clothing && `vestindo ${clothing}`
        ].filter(Boolean).join(', ') + '.';
        return parts;
    }, [formState]);
    
    const handleGeneratePreview = async () => {
        if (!formState.name.trim() || nameError) {
            setNameError('Por favor, insira um nome válido e único.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setPreviewUrl(null);
        
        const desc = buildDescription();
        setDescription(desc);

        try {
            const prompt = `${desc}, ${BIBLIOTECA_PERSONAGENS.estilo_base}, character portrait, white background`;
            const url = await generateImageFromText(prompt);
            setPreviewUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao gerar preview.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (formState.name && description && previewUrl && !nameError) {
            onSave({
                name: formState.name.trim(),
                description,
                imageUrl: previewUrl
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-700/50 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Criador de Personagens</h3>
                    <p className="text-sm text-gray-400 mt-1">Descreva seu personagem, gere uma imagem e salve-o em sua biblioteca.</p>
                </div>
                
                <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
                    {/* Coluna do Formulário */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="char-name" className={formLabelStyle}>Nome do Personagem</label>
                            <input id="char-name" type="text" value={formState.name} onChange={(e) => handleInputChange('name', e.target.value)} className={formInputStyle} placeholder="Ex: Golias" />
                            {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="char-body" className={formLabelStyle}>Corpo</label>
                                <select id="char-body" value={formState.body} onChange={(e) => handleInputChange('body', e.target.value)} className={formSelectStyle}>
                                    <option value="magro">Magro</option>
                                    <option value="gordo">Gordo</option>
                                    <option value="musculoso">Musculoso</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="char-hair-len" className={formLabelStyle}>Cabelo (Comprimento)</label>
                                <select id="char-hair-len" value={formState.hairLength} onChange={(e) => handleInputChange('hairLength', e.target.value)} className={formSelectStyle}>
                                    <option value="curto">Curto</option>
                                    <option value="médio">Médio</option>
                                    <option value="longo">Longo</option>
                                    <option value="careca">Careca</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="char-hair-style" className={formLabelStyle}>Cabelo (Estilo/Cor)</label>
                            <input id="char-hair-style" type="text" value={formState.hairStyle} onChange={(e) => handleInputChange('hairStyle', e.target.value)} className={formInputStyle} placeholder="Ex: cacheado e ruivo" />
                        </div>
                        <div>
                            <label htmlFor="char-face" className={formLabelStyle}>Rosto</label>
                            <input id="char-face" type="text" value={formState.face} onChange={(e) => handleInputChange('face', e.target.value)} className={formInputStyle} placeholder="Ex: com barba por fazer, sardas" />
                        </div>
                        <div>
                            <label htmlFor="char-clothing" className={formLabelStyle}>Roupagem</label>
                            <input id="char-clothing" type="text" value={formState.clothing} onChange={(e) => handleInputChange('clothing', e.target.value)} className={formInputStyle} placeholder="Ex: túnicas reais elegantes" />
                        </div>
                    </div>
                    
                    {/* Coluna do Preview */}
                    <div className="flex flex-col space-y-4">
                         <div className="aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <div className="text-center text-gray-400">
                                    <WandSparklesIcon className="h-10 w-10 mx-auto animate-pulse text-indigo-400"/>
                                    <p className="mt-2 text-sm">Gerando preview...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-400 p-4">
                                    <p><strong>Erro!</strong></p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : previewUrl ? (
                                <img src={previewUrl} alt="Preview do personagem" className="w-full h-full object-cover" />
                            ) : (
                                 <div className="text-center text-gray-500">
                                    <p>O preview do seu personagem aparecerá aqui</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleGeneratePreview} disabled={isLoading || !formState.name.trim() || !!nameError} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
                           {isLoading ? (
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           ) : (
                                <ZapIcon className="h-5 w-5 mr-2" />
                           )}
                           Gerar Preview
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-800/50 flex justify-end space-x-3 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!previewUrl || !!nameError} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Salvar Personagem
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreatorModal;
