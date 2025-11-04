export async function handler(event) {
  try {
    const { prompt } = JSON.parse(event.body);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const buffer = await response.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Proxy error", details: err.message }),
    };
  }
            }
