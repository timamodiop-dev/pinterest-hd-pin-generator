import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url) {
      return { statusCode: 400, body: "Missing Etsy URL" };
    }

    // Fetch Etsy HTML
    const html = await fetch(url).then(res => res.text());

    // Extract image URLs from Etsy JSON inside the page
    const jsonMatch = html.match(/"images":(\[.*?\])/);
    if (!jsonMatch) {
      return { statusCode: 400, body: JSON.stringify({ error: "Images JSON not found" }) };
    }

    const imagesJSON = JSON.parse(jsonMatch[1]);

    if (!imagesJSON.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "No images found" }) };
    }

    // Get the FIRST full-size image
    const firstImage = imagesJSON[0].url_fullxfull || imagesJSON[0].url_570xN || null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: firstImage,
        title: "Etsy Product"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
}
