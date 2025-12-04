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

    let firstImage = null;

    // 1️⃣ Try old JSON format: "images":[{url_fullxfull:""}]
    const oldMatch = html.match(/"images":(\[.*?\])/);
    if (oldMatch) {
      const arr = JSON.parse(oldMatch[1]);
      firstImage =
        arr[0].url_fullxfull ||
        arr[0].url_170x135 ||
        arr[0].url_570xN ||
        null;
    }

    // 2️⃣ Try new format: "image_url":"https://i.etsystatic.com/..."
    if (!firstImage) {
      const imageUrlMatch = html.match(/"image_url":"(https:\/\/[^"]+)"/);
      if (imageUrlMatch) {
        firstImage = imageUrlMatch[1];
      }
    }

    // 3️⃣ Try Schema.org JSON: "image":["https://..."]
    if (!firstImage) {
      const schemaMatch = html.match(/"image":\["(https:\/\/[^"]+)"/);
      if (schemaMatch) {
        firstImage = schemaMatch[1];
      }
    }

    // 4️⃣ Try thumbnail format: "src":"https://..."
    if (!firstImage) {
      const srcMatch = html.match(/"src":"(https:\/\/i\.etsystatic\.com[^"]+)"/);
      if (srcMatch) {
        firstImage = srcMatch[1];
      }
    }

    if (!firstImage) {
      return { statusCode: 400, body: JSON.stringify({ error: "No images found" }) };
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
