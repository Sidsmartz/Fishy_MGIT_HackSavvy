function highlightDivs() {
  document.querySelectorAll("div").forEach(div => {
    if (div.children.length > 0) return; // Only outline topmost elements

    div.style.outline = "2px solid red";

    div.addEventListener("click", async function handler(e) {
      e.stopPropagation();
      e.preventDefault();

      const content = div.innerText.trim();
      const img = div.querySelector("img");
      const video = div.querySelector("video");

      let requestData;
      if (img) {
        requestData = { image: img.src };
      } else if (video) {
        requestData = { video: video.src };
      } else if (content) {
        requestData = { text: content };
      } else {
        return;
      }

      fetch("http://localhost:3000/check-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      })
      .then(res => res.json())
      .then(data => showOverlay(div, data));

      div.removeEventListener("click", handler);
    }, { once: true });
  });
}

function showOverlay(element, data) {
  const overlay = document.createElement("div");
  overlay.innerText = `Deepfake: ${data.result} | Confidence: ${data.confidence || "N/A"}`;
  overlay.style.position = "absolute";
  overlay.style.background = "rgba(255,0,0,0.8)";
  overlay.style.color = "#fff";
  overlay.style.padding = "5px";
  overlay.style.borderRadius = "5px";
  overlay.style.zIndex = "1000";
  overlay.style.left = `${element.getBoundingClientRect().left}px`;
  overlay.style.top = `${element.getBoundingClientRect().top}px`;
  overlay.style.transform = "translateY(-100%)"; // Adjust to stay near the image
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    element.style.outline = "none";
  }, 5000);
}

highlightDivs();
