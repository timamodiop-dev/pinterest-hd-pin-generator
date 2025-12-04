import fetch from "node-fetch";

export async function handler(event) {
    try {
        const { url } = JSON.parse(event.body || "{}");
        if (!url) return { statusCode: 400, body: "Missing Etsy URL" };

        // Fetch Etsy HTML
        const html = await fetch(url).then(res => res.text());

        // Extract HD images
        const imgRegex = /https:\/\/i\.etsystatic\.com\/[^"]+fullxfull[^"]+/g;
        const images = html.match(imgRegex);

        if (!images || images.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "No images found" })
            };
        }

        // Extract product title
        const titleRegex = /<meta property="og:title" content="([^"]+)"/;
        const titleMatch = html.match(titleRegex);
        const title = titleMatch ? titleMatch[1] : "Untitled Product";

        return {
            statusCode: 200,
            body: JSON.stringify({
                image: images[0],   // FIRST HD image
                title: title
            })
        };

    } catch (err) {
        return { statusCode: 500, body: "Server Error" };
    }
}
