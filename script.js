async function fetchEtsyData() {
    const url = document.getElementById("etsyURL").value.trim();
    if (!url) {
        alert("Please paste an Etsy listing URL.");
        return;
    }

    document.getElementById("loading").style.display = "block";

    try {
        // Call Netlify backend function
        const response = await fetch("/.netlify/functions/fetchEtsy", {
            method: "POST",
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        document.getElementById("loading").style.display = "none";

        if (!data.image) {
            alert("No valid image found.");
            return;
        }

        document.getElementById("productImage").src = data.image;
        generateSEO(data.title);
    } 
    catch (error) {
        document.getElementById("loading").style.display = "none";
        alert("Error fetching Etsy data.");
    }
}

function generateSEO(title) {
    const line1 = `${title} | Pinterest Pin`;
    const line2 = `Discover ${title} – perfect for Etsy shoppers looking for unique finds.`;
    const line3 = `${title}, trending item, aesthetic vibes`;
    const line4 = `#etsy #shopping #fashion`;

    document.getElementById("seo1").value = line1;
    document.getElementById("seo2").value = line2;
    document.getElementById("seo3").value = line3;
    document.getElementById("seo4").value = line4;
}

document.getElementById("generateBtn").addEventListener("click", fetchEtsyData);
