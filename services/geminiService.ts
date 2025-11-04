import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AIPanelData, Comic, Panel } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. Using a placeholder key.");
}

const ai = new GoogleGenAI({apiKey: process.env.API_KEY || 'YOUR_API_KEY_HERE' });

const panelSchema = {
    type: Type.OBJECT,
    properties: {
        observation: { type: Type.STRING, description: "What the character is observing or experiencing." },
        reasoning: { type: Type.STRING, description: "The character's internal thought process or medical reasoning." },
        action: { type: Type.STRING, description: "The concrete action the character takes." },
        expectation: { type: Type.STRING, description: "What the character expects to happen as a result of the action." },
        visualDescription: { type: Type.STRING, description: "A detailed description for the artist of what to draw in the panel. Focus on setting, character positions, expressions, and key objects." },
        caption: { type: Type.STRING, description: "A short, narrative caption for the panel (can be an empty string)." },
        dialogue: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    character: { type: Type.STRING },
                    line: { type: Type.STRING }
                },
                required: ['character', 'line']
            }
        },
        suggestions: { type: Type.STRING, description: "Suggestions for improving the educational clarity or flow of the panel." }
    },
    required: ['observation', 'reasoning', 'action', 'expectation', 'visualDescription', 'caption', 'dialogue', 'suggestions']
};

const getSystemInstruction = (comic: Comic): string => {
    return `You are a professional television writer creating a serialized medical drama in the style of Grey's Anatomy, set in Zenith Teaching Hospital, Lagos. Your task is to transform a medical excerpt into a series of 2-4 compelling, character-driven comic book panels.
- Adhere strictly to the provided character list for dialogue and actions. All characters are Nigerian.
- The drama and character interactions are paramount. Weave the medical education seamlessly into the narrative.
- For each panel, provide a JSON object with all required fields. The visualDescription must be cinematic. Dialogue must be authentic to the characters.

Comic Context:
- Subject: ${comic.subject}
- Topic: ${comic.topic}
- Ward: ${comic.ward}
- Characters in this story: ${JSON.stringify(comic.characters)}
- Story so far (summary of last panel): "${comic.storyState.lastPanelSummary}"
`;
}

export const generateStoryPanels = async (comic: Comic, excerpt: string): Promise<AIPanelData[]> => {
    const model = 'gemini-2.5-pro';

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [{ text: `Based on the context, generate panels for the following excerpt:\n\n"${excerpt}"` }]
        },
        config: {
            systemInstruction: getSystemInstruction(comic),
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: panelSchema
            }
        }
    });

    try {
        let jsonText = response.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        }
        const panels = JSON.parse(jsonText);
        if (!Array.isArray(panels)) {
            throw new Error("AI did not return a valid array of panels.");
        }
        return panels;
    } catch (e) {
        console.error("Failed to parse AI response:", response.text, e);
        throw new Error("Failed to generate valid story panels. Please try again.");
    }
};

const getCharacterListFromPanel = (panel: Panel, comic: Comic) => {
    const characterNames = new Set(panel.dialogue.map(d => d.character));
    return comic.characters.filter(c => characterNames.has(c.name));
}

export const generateImage = async (panel: Panel, comic: Comic): Promise<{ base64Data: string, mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';
    
    const charactersInPanel = getCharacterListFromPanel(panel, comic);
    const dialogueLines = panel.dialogue.map(d => `- ${d.character}: "${d.line}"`).join('\n');

    const prompt = `A comic book panel illustration in a modern medical drama style with clean lines and balanced colors. The setting is a hospital in Lagos, Nigeria.
---
**IMPORTANT CULTURAL CONTEXT:** All characters depicted MUST be Nigerian (Black African).
---
**Visual Description:** ${panel.visualDescription}
**Characters in Panel & Description:** ${charactersInPanel.map(c => `${c.name} (${c.description})`).join(', ')}
**Action Taking Place:** ${panel.action}
**Overall Mood:** Based on the observation ("${panel.observation}") and reasoning ("${panel.reasoning}"), the mood should be tense/educational/calm/etc.
**Dialogue to include in speech bubbles:**
${dialogueLines || "No dialogue in this panel."}
---
Generate the image for this complete panel context.`;

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return {
            base64Data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
        };
    }
    return null;
}

export const editImage = async (base64ImageData: string, mimeType: string, editPrompt: string): Promise<{ base64Data: string, mimeType: string } | null> => {
    const model = 'gemini-2.5-flash-image';
    const fullPrompt = `In a modern medical drama comic book style, ensuring all characters remain Nigerian (Black African), perform the following edit: "${editPrompt}"`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType } },
                { text: fullPrompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return {
            base64Data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
        };
    }
    return null;
}

export const regeneratePanelField = async (comic: Comic, panel: Panel, fieldToRegenerate: keyof Omit<AIPanelData, 'dialogue'>): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    const instruction = `You are a creative writer for medical education comics. Based on the comic context and the current panel's data, regenerate only the "${fieldToRegenerate}" field to be more compelling, clear, or medically accurate. Provide only the text for that field.

Comic Context:
- Subject: ${comic.subject}
- Topic: ${comic.topic}
- Characters: ${JSON.stringify(comic.characters)}

Current Panel Data:
${JSON.stringify(panel, null, 2)}

Regenerate the "${fieldToRegenerate}" field. Return only the new string content for this field, without any labels or JSON formatting.`;

    const response = await ai.models.generateContent({
        model,
        contents: instruction
    });
    
    return response.text.trim();
};