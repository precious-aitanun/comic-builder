// Function to convert a File object to a GoogleGenerativeAI.Part object.
export async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const generateImagePromptForPanel = (panel: import('../types').Panel): string => {
    const dialogueLines = panel.dialogue.map(d => `- ${d.character}: "${d.line}"`).join('\n');

    // This prompt structure is intended to be used with the comic's style guide as a system prompt or prefix.
    const panelPrompt = `
**Panel Context & Instructions:**
---
- **Visual Description:** ${panel.visualDescription}
- **Action Taking Place:** ${panel.action}
- **Dialogue to be depicted in speech bubbles:**
${dialogueLines || "No dialogue in this panel."}
- **Overall Mood:** Based on the observation ("${panel.observation}") and reasoning ("${panel.reasoning}").
- **Characters Present:** ${[...new Set(panel.dialogue.map(d => d.character))].join(', ')}
---
Synthesize this into a single image, adhering to the established style guide for the comic.
    `;
    return panelPrompt.trim();
};

export const generateEditedImagePromptForPanel = (originalPrompt: string, editInstruction: string): string => {
    const editedPrompt = `
**Original Prompt Idea (for context):**
---
${originalPrompt}
---
**User's Edit Request:**
---
"${editInstruction}"
---
**Revised Prompt:**
Please generate an image based on the original prompt's core idea, but with the following modification: ${editInstruction}.
    `;
    return editedPrompt.trim();
};

export const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

export const comicToMarkdown = (comic: import('../types').Comic): string => {
    let md = `# ${comic.topic}\n\n`;
    md += `**Subject:** ${comic.subject}\n`;
    md += `**Ward:** ${comic.ward}\n`;
    md += `**Characters:** ${comic.characters.map(c => c.name).join(', ')}\n\n`;
    md += `## Style Guide Prompt\n\n\`\`\`\n${comic.styleGuidePrompt}\n\`\`\`\n\n`;
    
    comic.panels.forEach((panel, index) => {
        md += `## Panel ${index + 1}\n\n`;
        if (panel.imageGenerationPrompt) {
            md += `**Image Generation Prompt:**\n`;
            md += `\`\`\`\n${panel.imageGenerationPrompt}\n\`\`\`\n\n`;
        }
        md += `**Visual Description:** ${panel.visualDescription}\n\n`;
        
        if (panel.caption) {
            md += `**Caption:** ${panel.caption}\n\n`;
        }

        if (panel.dialogue && panel.dialogue.length > 0) {
            md += `**Dialogue:**\n`;
            panel.dialogue.forEach(d => {
                md += `*   **${d.character}:** "${d.line}"\n`;
            });
            md += `\n`;
        }

        md += `*   **Observation:** ${panel.observation}\n`;
        md += `*   **Reasoning:** ${panel.reasoning}\n`;
        md += `*   **Action:** ${panel.action}\n`;
        md += `*   **Expectation:** ${panel.expectation}\n`;
        md += `*   **Suggestions/Corrections:** ${panel.suggestions}\n\n`;
    });

    return md;
}
