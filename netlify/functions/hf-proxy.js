export async function handler(event) {
  // Handle the browser's preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ 
          error: "Hugging Face API error", 
          status: response.status,
          details: errorText 
        }),
      };
    }

    // Parse the JSON response from Hugging Face router
    const data = await response.json();
    
    // Extract base64 image from the new router format: artifacts[0].base64
    if (!data.artifacts || !data.artifacts[0] || !data.artifacts[0].base64) {
      console.error("Unexpected HF response format:", data);
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ 
          error: "Invalid response format from Hugging Face", 
          details: "Missing artifacts[0].base64 field" 
        }),
      };
    }

    const base64Image = data.artifacts[0].base64;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "text/plain",
      },
      body: base64Image,
      isBase64Encoded: false, // We're returning the base64 string as text, not binary
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Proxy error", details: err.message }),
    };
  }
}
