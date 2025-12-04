import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url) return { statusCode: 400, body: "Missing Etsy URL" };

    // Extract listing ID from URL
    const match = url.match(/listing\/(\d+)/);
    if (!match) return { statusCode: 400, body: "Invalid Etsy URL" };

    const listingId = match[1];

    // Fetch Etsy HTML page
    const html = await fetch(url).then(res => res.text());

    // Extract FIRST available full-size image
    const imgRegex = /https:\/\/i\.etsystatic\.com\/[^"]+fullxfull[^"]+/g;
    const images = html.match(imgRegex);

    if (!images || images.length === 0) {
      return { statusCode: 404, body: "No images found" };
    }

    // Return the first best-quality image URL
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: images[0] })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Server error: " + err.message
    };
  }
}
