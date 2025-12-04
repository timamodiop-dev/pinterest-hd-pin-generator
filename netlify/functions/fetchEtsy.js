import fetch from "node-fetch";

export async function handler(event) {
    try {
        const { url } = JSON.parse(event.body || "{}");
        if (!url) return { statusCode: 400, body: "Missing Etsy URL" };

        const html = await fetch(url).then(res => res.text());

        const imgRegex = /https:\/\/i\.etsystatic\.com\/[^"]+fullxfull[^"]+/g;
        const images = html.match(imgRegex);

        if (!images || images.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "No images found" })
            };
        }

        const titleRegex = /<meta property="og:title" content="([^"]+)"/;
        const titleMatch = html.match(titleRegex);
        const title = titleMatch ? titleMatch[1] : "Untitled Product";

        return {
            statusCode: 200,
            body: JSON.stringify({
                image: images[0],
                title: title
            })
        };

    } catch (err) {
        return { statusCode: 500, body: "Server Error" };
    }
}
