function highlightDivs() {
  const divs = document.querySelectorAll("div");
  divs.forEach(div => {
    div.style.outline = "2px solid red";

    div.addEventListener("click", async function handler(e) {
      e.stopPropagation();
      e.preventDefault();

      const content = div.innerText.trim();
      const img = div.querySelector("img");
      const video = div.querySelector("video");

      let result = "Processing...";
      let confidence = "N/A";

      if (img) {
        ({ result, confidence } = await processImage(img));
      } else if (video) {
        ({ result, confidence } = await processVideo(video));
      } else if (content) {
        ({ result, confidence } = await processText(content));
      }

      showOverlay(div, result, confidence);
      chrome.runtime.sendMessage({ report: `${result} (Confidence: ${confidence}%)` });
    }, { once: true });
  });
}

async function processText(text) {
  const res = await fetch("http://localhost:3000/check-phishing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const data = await res.json();
  return { result: data.is_phishing ? "Phishing detected!" : "Safe", confidence: data.confidence || 80 };
}

async function processImage(img) {
  const blob = await fetch(img.src).then(res => res.blob());
  const formData = new FormData();
  formData.append("image", blob, "image.jpg");

  const res = await fetch("http://localhost:3000/check-image", { method: "POST", body: formData });
  const data = await res.json();
  return { result: data.deepfake_detected ? "Deepfake detected!" : "Safe", confidence: data.confidence || 90 };
}

async function processVideo(video) {
  const blob = await fetch(video.src).then(res => res.blob());
  const formData = new FormData();
  formData.append("video", blob, "video.mp4");

  const res = await fetch("http://localhost:3000/upload-video", { method: "POST", body: formData });
  const data = await res.json();
  return { result: data.deepfake_detected ? "Deepfake detected!" : "Safe", confidence: data.confidence || 85 };
}

function showOverlay(div, result, confidence) {
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.background = "rgba(255,0,0,0.7)";
  overlay.style.color = "white";
  overlay.style.padding = "5px";
  overlay.innerText = `${result} (Confidence: ${confidence}%)`;
  document.body.appendChild(overlay);

  const rect = div.getBoundingClientRect();
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;

  setTimeout(() => overlay.remove(), 5000);
}

highlightDivs();
