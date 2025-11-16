import React, { useEffect, useState } from 'react';
import { generateImageFromText } from '../services/geminiService';
import { BIBLIOTECA_PERSONAGENS } from '../constants';
import { WandSparklesIcon } from './icons';

interface CharacterPreviewModalProps {
    characterName: string;
    onClose: () => void;
    cache: { [key: string]: string };
    setCache: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

const CharacterPreviewModal: React.FC<CharacterPreviewModalProps> = ({ characterName, onClose, cache, setCache }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(cache[characterName] || null);
    const [isLoading, setIsLoading] = useState<boolean>(!cache[characterName]);
    const [error, setError] = useState<string | null>(null);
    const characterDescription = BIBLIOTECA_PERSONAGENS[characterName] || `Descrição para ${characterName} não encontrada.`;


    useEffect(() => {
        const generateImage = async () => {
            if (cache[characterName] || !characterDescription) {
                return;
            }
            try {
                const prompt = `${characterDescription}, ${BIBLIOTECA_PERSONAGENS.estilo_base}, character portrait, white background`;
                const url = await generateImageFromText(prompt);
                setImageUrl(url);
                setCache(prev => ({ ...prev, [characterName]: url }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Falha ao gerar imagem.');
            } finally {
                setIsLoading(false);
            }
        };

        generateImage();
    }, [characterName, characterDescription, cache, setCache]);

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{characterName}</h3>
                    <p className="text-sm text-gray-400 mt-1">{characterDescription}</p>
                </div>
                <div className="p-6">
                    <div className="aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                        {isLoading && (
                            <div className="text-center text-gray-400">
                                <WandSparklesIcon className="h-10 w-10 mx-auto animate-pulse text-indigo-400"/>
                                <p className="mt-2 text-sm">Gerando preview...</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-400 p-4">
                                <p><strong>Erro!</strong></p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {imageUrl && (
                            <img src={imageUrl} alt={`Preview of ${characterName}`} className="w-full h-full object-cover" />
                        )}
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

export default CharacterPreviewModal;
