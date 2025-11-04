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
    
    comic.panels.forEach((panel, index) => {
        md += `## Panel ${index + 1}\n\n`;
        if (panel.imageUrl && panel.imageMimeType) {
            md += `![Visual Description: ${panel.visualDescription}](data:${panel.imageMimeType};base64,${panel.imageUrl})\n\n`;
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
