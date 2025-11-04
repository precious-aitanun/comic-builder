import { GoogleGenAI, Modality, Type } from "@google/genai";
import { AIPanelData, Comic, Panel } from '../types';

// Warn if the key is missing
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set. Using a placeholder key.");
}

// Initialize the SDK with the key Vite injects at build time
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY_HERE",
});

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

export const generateImage = async (panel, comic) => {
  const charactersInPanel = panel.dialogue.map(d => `${d.character}: "${d.line}"`).join('\n');

  const prompt = `
A comic book panel illustration in a modern medical drama style set in Lagos, Nigeria.
All characters are Nigerian (Black African).
---
Visual Description: ${panel.visualDescription}
Characters in Panel: ${comic.characters.map(c => `${c.name} (${c.description})`).join(', ')}
Action Taking Place: ${panel.action}
Mood: ${panel.observation}
Dialogue:
${charactersInPanel || "No dialogue."}
`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const base64Data = await blobToBase64(blob);

    return { base64Data, mimeType: blob.type };
  } catch (err) {
    console.error("Error generating image:", err);
    return null;
  }
};

// helper to convert blob to base64
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const editImage = async (base64ImageData, mimeType, editPrompt) => {
  const fullPrompt = `
A comic book panel illustration in a modern medical drama style, set in a Lagos hospital.
All characters are Nigerian (Black African).
Perform the following edit: ${editPrompt}.
`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: fullPrompt }),
      }
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const base64Data = await blobToBase64(blob);

    return { base64Data, mimeType: blob.type };
  } catch (err) {
    console.error("Error editing image:", err);
    return null;
  }
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
