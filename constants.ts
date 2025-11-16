
import { CharacterLibrary } from './types';

export const BIBLIOTECA_PERSONAGENS: CharacterLibrary = {
    "estilo_base": "fofo, vibrante, estilo 3D cartoon, iluminação suave, renderização de alta qualidade, cinematic, wide shot, ensuring characters are fully visible and not cropped.",
    "Adão": "um homem em estilo 3D cartoon, pele clara, cabelo castanho curto, barba por fazer, vestindo uma simples túnica de folhas.",
    "Eva": "uma mulher em estilo 3D cartoon, pele clara, longos cabelos castanhos, vestindo uma simples túnica de folhas.",
    "Davi (Jovem)": "um jovem pastor em estilo 3D cartoon, cabelo cacheado ruivo, sardas, segurando um cajado ou uma funda.",
    "Davi (Rei)": "um rei em estilo 3D cartoon, com barba ruiva, vestindo túnicas reais e uma coroa simples.",
    "Sansão": "um homem musculoso em estilo 3D cartoon, com longos cabelos pretos e uma expressão confiante.",
    "Ester": "uma rainha persa em estilo 3D cartoon, linda, com vestes reais elegantes e joias.",
    "Samuel": "um profeta idoso em estilo 3D cartoon, com barba branca, túnicas simples e olhos sábios.",
    "Deus (Luz Divina)": "uma luz dourada brilhante e quente vindo de cima, raios de luz suaves, sem forma física.",
    "Serpente": "uma serpente astuta em estilo 3D cartoon, com escamas verdes brilhantes e olhos amarelos penetrantes."
};

export const PREDEFINED_CHARACTERS = Object.keys(BIBLIOTECA_PERSONAGENS).filter(key => key !== 'estilo_base');

export const LANGUAGES = [
    { value: 'Português (Brasil)', label: '🇧🇷 Português (Brasil)' },
    { value: 'English', label: '🇺🇸 English' },
    { value: 'Español', label: '🇪🇸 Español' },
];

export const TARGET_AUDIENCES = [
    { value: 'Infantil de 0 a 2 anos', label: '👶 Infantil (0-2 anos)' },
    { value: 'Infantil de 3 a 5 anos', label: '🧒 Infantil (3-5 anos)' },
    { value: 'Infantil de 6 a 10 anos', label: '👧 Infantil (6-10 anos)' },
    { value: 'Adolescente de 11 a 15 anos', label: '🧑 Adolescente (11-15 anos)' },
    { value: 'Jovem de 16 a 29 anos', label: '🧑‍🎓 Jovem (16-29 anos)' },
];
