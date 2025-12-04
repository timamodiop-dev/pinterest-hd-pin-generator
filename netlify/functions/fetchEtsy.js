import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { url } = JSON.parse(event.body || "{}");
    if (!url)
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Etsy URL" }) };

    // Fetch Etsy HTML
    const html = await fetch(url).then(res => res.text());

    // Extract the JSON data that contains images
    const jsonMatch = html.match(/"images":(\[.*?\])/s);
    if (!jsonMatch)
      return { statusCode: 400, body: JSON.stringify({ error: "Images JSON not found" }) };

    const imagesJSON = JSON.parse(jsonMatch[1]);
    if (!imagesJSON.length)
      return { statusCode: 400, body: JSON.stringify({ error: "No images found" }) };

    // Extract highest-quality full image
    const firstImage =
      imagesJSON[0].url_fullxfull ||
      imagesJSON[0].url_170x135 ||
      imagesJSON[0].url_570xN ||
      null;

    if (!firstImage)
      return { statusCode: 400, body: JSON.stringify({ error: "Image URL missing" }) };

    // Extract product title
    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
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
