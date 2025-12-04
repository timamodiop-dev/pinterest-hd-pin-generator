async function fetchEtsyData() {
    const url = document.getElementById("etsyURL").value;
    if (!url) return alert("Please paste an Etsy URL.");

    document.getElementById("loading").style.display = "block";

    const response = await fetch("/.netlify/functions/fetchEtsy?url=" + encodeURIComponent(url));
    const data = await response.json();

    document.getElementById("loading").style.display = "none";

    if (!data.images || data.images.length === 0) {
        return alert("No images found.");
    }

    generateSEO(data);
    generatePins(data);
}

function generateSEO(data) {
    document.getElementById("seoTitle").value = data.title;
    document.getElementById("seoDescription").value = data.description.slice(0, 250);
    document.getElementById("seoKeywords").value = data.tags.join(", ");
    document.getElementById("seoHashtags").value = data.tags.map(t => "#" + t.replace(/\s+/g,"")).join(" ");
}

function generatePins(data) {
    const container = document.getElementById("pinsContainer");
    container.innerHTML = "";

    data.images.forEach((imgURL, index) => {
        const card = document.createElement("div");
        card.className = "pinCard";

        const canvasDiv = document.createElement("div");
        canvasDiv.className = "pinCanvas";
        canvasDiv.id = "pinCanvas" + index;

        canvasDiv.innerHTML = `
            <img src="${imgURL}" class="pinImage">
            <div class="pinText">
                ${data.title}
                <span class="subtitle">✨ Cozy • Inspirational • Bestseller ✨</span>
            </div>
        `;

        card.appendChild(canvasDiv);

        const btn = document.createElement("button");
        btn.innerText = "Download Pin " + (index + 1);
        btn.onclick = () => downloadPin(canvasDiv);

        card.appendChild(btn);
        container.appendChild(card);
    });
}

function downloadPin(target) {
    html2canvas(target, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = "pinterest-pin.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}
