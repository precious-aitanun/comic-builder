import { GoogleGenAI, Type } from "@google/genai";
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

export const generateStyleGuidePrompt = async (comicData: Omit<Comic, 'id' | 'storyState' | 'panels' | 'progress' | 'createdAt' | 'styleGuidePrompt'>): Promise<string> => {
    const model = 'gemini-2.5-pro';
    const instruction = `
You are an expert comic book artist and prompt engineer. Your task is to create a detailed "Style Guide Prompt" for an AI image generator (like Midjourney or DALL-E) to ensure a consistent visual style for a new medical drama comic series.

The style should be a modern, clean-lined comic book aesthetic, balanced with a touch of realism suitable for a medical drama. The setting is Zenith Teaching Hospital in Lagos, Nigeria.

**IMPORTANT:** The core of this style guide is to ensure all characters are depicted as Nigerian (Black African). This must be a central, non-negotiable part of the prompt.

Based on the following comic details, generate the Style Guide Prompt.

**Comic Details:**
- **Subject:** ${comicData.subject}
- **Topic:** ${comicData.topic}
- **Ward/Setting:** ${comicData.ward}
- **Characters:**
${comicData.characters.map(c => `  - **${c.name}:** ${c.description}`).join('\n')}

**Output Requirements:**
The output should be a single block of text. This text will be used as a system instruction or a prefix for every image generation prompt in this comic series. It should include:
1.  A core art style definition (e.g., "Modern medical drama comic style, clean lines, balanced colors...").
2.  The mandatory instruction about character ethnicity ("All characters must be Nigerian, Black African...").
3.  A section detailing the specific visual attributes for each character listed above. Be descriptive (e.g., "Dr. Adetunji is in his late 40s, with a kind face, salt-and-pepper hair, often seen with glasses perched on his nose...").
4.  Guidance on the setting (e.g., "The hospital interiors should be clean, modern but busy, with signs of being a Nigerian public hospital...").

Generate only the style guide prompt text.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: instruction,
    });
    
    return response.text.trim();
};

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
