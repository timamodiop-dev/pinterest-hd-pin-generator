import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Etsy URL" }) };
    }

    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    }).then(res => res.text());

    // RETURN FIRST 1000 CHARACTERS OF HTML SO WE CAN SEE THE REAL STRUCTURE
    const debugSample = html.substring(0, 2000);

    return {
      statusCode: 200,
      body: JSON.stringify({
        debug: debugSample
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: error.message
      })
    };
  }
}
