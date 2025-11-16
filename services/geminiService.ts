import { GoogleGenAI, Modality } from '@google/genai';

// Helper to handle errors gracefully
const handleApiError = (error: any, context: string) => {
    console.error(`Gemini API error (${context}):`, error);
    // Provide a user-friendly error message
    if (error instanceof Error && error.message.includes('API key not valid')) {
         return new Error(`Chave de API inválida ou sem permissão para este modelo. Para gerar vídeos, por favor, selecione uma chave de API associada a um projeto com faturamento ativado.`);
    }
    // Improved error for missing key
    if (error instanceof Error && error.message.includes('API key not found')) {
        return new Error(`Chave de API da Gemini (VITE_API_KEY) não encontrada. Por favor, adicione-a ao seu arquivo .env.local para gerar roteiros e imagens.`);
    }
    return new Error(`Falha na comunicação com a API de IA (${context}). Verifique o console para mais detalhes.`);
};

/**
 * Creates a Gemini client instance on-demand.
 * Throws an error if the API key is not available in the environment variables.
 */
const getClient = () => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
        throw new Error('API key not found');
    }
    return new GoogleGenAI({ apiKey });
};


/**
 * Generates a detailed production plan including script, image prompts, and director prompts.
 */
export const generateProductionPlan = async (
    storyIdea: string,
    characterLibrary: { [key: string]: string },
    language: string,
    targetAudience: string
): Promise<string> => {
    // A detailed prompt instructing the model to act as a senior director for children's animation.
    const characterDescriptions = Object.entries(characterLibrary)
        .filter(([key]) => key !== 'estilo_base')
        .map(([name, desc]) => `- ${name}: ${desc}`)
        .join('\n');

    const systemInstruction = `Você é um mestre contador de histórias e narrador, um especialista em prender a atenção das crianças e transformar histórias infantis em algo que realmente mantém os olhos do espectador infantil fixos na tela. Você também é um especialista em marketing de conteúdo para o YouTube, mestre em criar thumbnails que geram cliques e descrições que otimizam o alcance.
Sua missão é preservar a essência e a originalidade da história, mas realizar os incrementos necessários para maximizar o engajamento.

Sua tarefa é pegar uma ideia de história e transformá-la em um plano de produção detalhado, formatado como um JSON.

O JSON deve ter a seguinte estrutura:
{
  "titulo": "Um título criativo e cativante para a história",
  "youtube_thumbnail": {
    "prompt_16_9": "Um prompt para uma thumbnail 16:9 super atrativa, seguindo o estilo visual principal. Use cores vibrantes e uma composição cinematográfica que mostre os personagens principais de corpo inteiro, sem cortes (wide shot). A cena deve gerar curiosidade, mostrando um momento chave ou uma expressão facial intrigante, mas sem entregar a história toda. A consistência com a aparência definida dos personagens é crucial.",
    "prompt_9_16": "Um prompt para uma thumbnail 9:16 (Shorts) igualmente atrativa e vertical. Foco total em um personagem central em uma pose dinâmica e expressiva, garantindo que ele esteja visível por inteiro, sem cortes. A cena deve ser impactante e curiosa. A consistência com a aparência definida do personagem é crucial.",
    "descricao_youtube": "Uma descrição otimizada para o vídeo, com um parágrafo cativante que resume a história, seguido por uma lista de hashtags relevantes para o público infantil e a história bíblica. Ex: #historiabiblica #desenhoinfantil #davi"
  },
  "cenas": [
    {
      "dialogo": "Diálogo ou narração para a cena. Use [NOME_DO_PERSONAGEM] para indicar quem fala. CRÍTICO: Incorpore técnicas de narração diretamente no texto, usando parênteses para indicar o tom de voz. Exemplos: (com uma voz sussurrada e misteriosa), (rindo de forma contagiante), (falando bem devagar para criar suspense).",
      "prompt_imagem": "Um prompt detalhado para gerar a imagem principal (keyframe) da cena. Descreva a composição, personagens (usando [NOME_DO_PERSONAGEM]), cenário e emoção. Seja visual e específico.",
      "prompt_diretor": "Instruções detalhadas de direção para animar a cena, pensando como um diretor de animação infantil de ponta. Inclua: animação dos personagens (linguagem corporal exagerada e expressões faciais claras), movimentos de câmera dinâmicos para reter a atenção (como 'zoom rápido no susto do personagem', 'câmera segue o personagem correndo'), iluminação que cria a atmosfera ('luz mágica e brilhante em volta do anjo') e sonoplastia impactante ('som cômico de mola quando o personagem cai', 'música de aventura que cresce empolgantemente')."
    }
  ]
}

Regras:
1.  O JSON de saída DEVE ser estritamente válido. Não inclua texto ou explicações fora do objeto JSON.
2.  Use os personagens fornecidos. Inclua seus nomes entre colchetes, ex: [Davi (Jovem)], nos campos 'dialogo' e 'prompt_imagem'.
3.  Adapte o tom, o ritmo e a complexidade para o público-alvo especificado. Pense no tempo de atenção da idade selecionada.
4.  O idioma do roteiro deve ser o especificado.
5.  Seja extremamente criativo e visualmente descritivo em todos os prompts.`;

    const userPrompt = `Gere o plano de produção para a seguinte ideia:
- Ideia da História: ${storyIdea}
- Público-Alvo: ${targetAudience}
- Idioma: ${language}
- Personagens Disponíveis:
${characterDescriptions}
`;

    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
            }
        });

        return response.text;
    } catch (error) {
        throw handleApiError(error, 'generate-plan');
    }
};

/**
 * Generates an image from a text prompt. Used for character portraits and scenes without references.
 */
export const generateImageFromText = async (prompt: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('Nenhuma imagem foi gerada pela API.');
    } catch (error) {
        throw handleApiError(error, 'generate-image-text');
    }
};


/**
 * Generates an image from a text prompt and reference images for character consistency.
 */
export const generateImageFromTextAndImage = async (prompt: string, referenceImageUrls: string[]): Promise<string> => {
    try {
        const ai = getClient();
        const imageParts = referenceImageUrls.map(url => {
            const base64Data = url.split(',')[1];
            if (!base64Data) {
                throw new Error('URL de imagem de referência inválida.');
            }
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/png',
                },
            };
        });

        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [...imageParts, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('Nenhuma imagem foi gerada pela API.');
    } catch (error) {
        throw handleApiError(error, 'generate-image-consistency');
    }
};

/**
 * Generates a video by animating a starting image based on a text prompt.
 */
export const generateVideoFromImageAndText = async (prompt: string, imageUrl: string): Promise<string> => {
    try {
        // Create a new client instance for each call to ensure the latest API key is used
        const videoAi = getClient();
        
        const base64Data = imageUrl.split(',')[1];
        if (!base64Data) {
            throw new Error('URL da imagem base é inválida.');
        }

        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png',
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Poll for the result
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('Falha ao obter o link de download do vídeo.');
        }

        // Fetch the video data using the download link
        const videoResponse = await fetch(`${downloadLink}&key=${import.meta.env.VITE_API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Falha ao baixar o vídeo. Status: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        throw handleApiError(error, 'generate-video');
    }
};