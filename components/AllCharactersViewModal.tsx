import React, { useEffect, useState } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { BIBLIOTECA_PERSONAGENS } from '../constants';
import { WandSparklesIcon } from './icons';
import { CharacterLibrary } from '../types';

interface CharacterGridItemProps {
    characterName: string;
    isLoading: boolean;
    imageUrl: string | null;
}

const CharacterGridItem: React.FC<CharacterGridItemProps> = ({ characterName, isLoading, imageUrl }) => {
    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="w-full aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading ? (
                    <WandSparklesIcon className="h-8 w-8 animate-pulse text-indigo-400"/>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={characterName} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-xs text-red-400 text-center p-2">Falha</div>
                )}
            </div>
            <p className="text-sm font-medium text-center truncate w-full">{characterName}</p>
        </div>
    );
};


interface AllCharactersViewModalProps {
    onClose: () => void;
    characterLibrary: CharacterLibrary;
    cache: { [key: string]: string };
    setCache: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

const AllCharactersViewModal: React.FC<AllCharactersViewModalProps> = ({ onClose, characterLibrary, cache, setCache }) => {
    
    const [generating, setGenerating] = useState<Set<string>>(new Set());
    const characterNames = Object.keys(characterLibrary).filter(key => key !== 'estilo_base');

    useEffect(() => {
        const API_DELAY_MS = 1200;
        let isCancelled = false;

        const generateMissingImages = async () => {
            for (const name of characterNames) {
                if (isCancelled) break;

                if (!cache[name]) {
                    try {
                        setGenerating(prev => new Set(prev).add(name));
                        const description = characterLibrary[name];
                        const prompt = `${description}, ${BIBLIOTECA_PERSONAGENS.estilo_base}, character portrait, white background`;
                        const url = await generateImageFromText(prompt);

                        if (!isCancelled) {
                            setCache(prev => ({ ...prev, [name]: url }));
                        }
                    } catch (err) {
                        console.error(`Failed to generate image for ${name}:`, err);
                        if (!isCancelled) {
                            setCache(prev => ({ ...prev, [name]: 'error' })); 
                        }
                    } finally {
                        if (!isCancelled) {
                            setGenerating(prev => {
                                const next = new Set(prev);
                                next.delete(name);
                                return next;
                            });
                            await new Promise(resolve => setTimeout(resolve, API_DELAY_MS));
                        }
                    }
                }
            }
        };

        generateMissingImages();

        return () => {
            isCancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700/50 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">Sua Biblioteca de Personagens</h3>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {characterNames.map(name => (
                            <CharacterGridItem 
                                key={name}
                                characterName={name}
                                isLoading={generating.has(name)}
                                imageUrl={cache[name] === 'error' ? null : cache[name] || null}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gray-800/50 text-right rounded-b-2xl border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllCharactersViewModal;
