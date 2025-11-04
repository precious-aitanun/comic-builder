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

    // Use Stable Diffusion XL - it's available and generates better quality images
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: prompt,
          options: {
            use_cache: false,
            wait_for_model: true
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF API error:", response.status, errorText);
      
      // Provide helpful error messages
      let errorMessage = "Hugging Face API error";
      if (response.status === 503) {
        errorMessage = "Model is loading. Please try again in 20-30 seconds.";
      } else if (response.status === 401) {
        errorMessage = "Invalid API token. Check your HUGGINGFACE_TOKEN environment variable.";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Please wait a moment before trying again.";
      }
      
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          error: errorMessage, 
          status: response.status,
          details: errorText 
        }),
      };
    }

    // The standard API returns raw image bytes
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "text/plain",
      },
      body: base64Image,
      isBase64Encoded: false,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Proxy error", details: err.message }),
    };
  }
}
