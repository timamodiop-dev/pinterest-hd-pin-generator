import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing Etsy URL" })
      };
    }

    // Fetch Etsy page HTML
    const html = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US"
      }
    }).then(res => res.text());

    let imagesJSON = null;

    // 1️⃣ Try "listingImages"
    let match1 = html.match(/"listingImages":(\[.*?\])/s);
    if (match1) {
      imagesJSON = JSON.parse(match1[1]);
    }

    // 2️⃣ Try "imageData" block
    if (!imagesJSON) {
      let match2 = html.match(/"imageData":(\[.*?\])/s);
      if (match2) imagesJSON = JSON.parse(match2[1]);
    }

    // 3️⃣ Try older "images" array
    if (!imagesJSON) {
      let match3 = html.match(/"images":(\[.*?\])/s);
      if (match3) imagesJSON = JSON.parse(match3[1]);
    }

    if (!imagesJSON || !imagesJSON.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No images found in Etsy data" })
      };
    }

    // Extract BEST QUALITY available
    const imgObj = imagesJSON[0];

    const firstImage =
      imgObj.url_fullxfull ||
      imgObj.full_width_url ||
      imgObj.full_height_url ||
      imgObj.url_570xN ||
      imgObj.url_170x135 ||
      imgObj.src ||
      null;

    if (!firstImage) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No usable image URL found" })
      };
    }

    // Extract title from OG meta tag
    let titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    const title = titleMatch ? titleMatch[1] : "Etsy Product";

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: firstImage,
        title: title
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
        details: err.message
      })
    };
  }
}
