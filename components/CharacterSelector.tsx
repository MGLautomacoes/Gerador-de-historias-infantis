import React, { useState } from 'react';
import { PREDEFINED_CHARACTERS as INITIAL_PREDEFINED_CHARACTERS } from '../constants';
import { UserPlusIcon, CheckCircleIcon, EyeIcon, Trash2Icon, UsersIcon } from './icons';
import CharacterPreviewModal from './CharacterPreviewModal';

interface CharacterSelectorProps {
    selectedCharacters: string[];
    setSelectedCharacters: React.Dispatch<React.SetStateAction<string[]>>;
    characterImageCache: { [key: string]: string };
    setCharacterImageCache: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    predefinedCharacters: string[];
    onOpenCreatorModal: () => void;
    onOpenViewAllModal: () => void;
    onDeleteCustomCharacter: (name: string) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
    selectedCharacters, 
    setSelectedCharacters,
    characterImageCache,
    setCharacterImageCache,
    predefinedCharacters,
    onOpenCreatorModal,
    onOpenViewAllModal,
    onDeleteCustomCharacter,
}) => {
    const [characterToPreview, setCharacterToPreview] = useState<string | null>(null);

    const handleToggleCharacter = (name: string) => {
        setSelectedCharacters(prev =>
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const handlePreviewClick = (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        setCharacterToPreview(name);
    }

    const handleDeleteClick = (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        onDeleteCustomCharacter(name);
    }

    return (
        <>
            {characterToPreview && (
                <CharacterPreviewModal
                    characterName={characterToPreview}
                    onClose={() => setCharacterToPreview(null)}
                    cache={characterImageCache}
                    setCache={setCharacterImageCache}
                />
            )}
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="block text-sm font-medium text-gray-300">3. Personagens</h3>
                        <button type="button" onClick={onOpenViewAllModal} className="text-gray-400 hover:text-white transition-colors" aria-label="Visualizar todos os personagens">
                            <UsersIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto p-1 border-y border-gray-800">
                        {predefinedCharacters.map(name => {
                            const isCustom = !INITIAL_PREDEFINED_CHARACTERS.includes(name);
                            return (
                                <div
                                    key={name}
                                    onClick={() => handleToggleCharacter(name)}
                                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 group ${
                                        selectedCharacters.includes(name) ? 'bg-indigo-800/50' : 'bg-gray-800 hover:bg-gray-700/70'
                                    }`}
                                >
                                    <CheckCircleIcon className={`h-5 w-5 mr-3 transition-colors ${selectedCharacters.includes(name) ? 'text-indigo-400' : 'text-gray-600'}`} />
                                    <span className="text-sm flex-grow">{name}</span>
                                    <button type="button" onClick={(e) => handlePreviewClick(e, name)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity mr-2" aria-label={`Preview ${name}`}>
                                        <EyeIcon className="h-5 w-5" />
                                    </button>
                                    {isCustom && (
                                        <button type="button" onClick={(e) => handleDeleteClick(e, name)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity" aria-label={`Deletar ${name}`}>
                                            <Trash2Icon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={onOpenCreatorModal}
                        className="w-full flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 text-gray-200 py-2.5 px-4 rounded-lg transition-colors text-sm"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2"/>
                        Criar Personagem Customizado
                    </button>
                </div>
            </div>
        </>
    );
};

export default CharacterSelector;
