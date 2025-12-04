import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Etsy URL" }) };
    }

    // Fetch Etsy page HTML
    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    }).then(res => res.text());

    // Look for the "image" JSON block
    const jsonMatch = html.match(/"images":(\[.*?\])/);
    if (!jsonMatch) {
      return { statusCode: 400, body: JSON.stringify({ error: "Images JSON not found" }) };
    }

    const imagesJSON = JSON.parse(jsonMatch[1]);

    if (!imagesJSON.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "No images found" }) };
    }

    // Etsy image URLs (choose HD versions)
    const firstImage =
      imagesJSON[0].url_fullxfull ||
      imagesJSON[0].url_170x135 ||
      imagesJSON[0].url_570xN ||
      null;

    if (!firstImage) {
      return { statusCode: 400, body: JSON.stringify({ error: "Image URL missing" }) };
    }

    // Extract product title
    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    const title = titleMatch ? titleMatch[1] : "Etsy Product";

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: firstImage,
        title
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
}
