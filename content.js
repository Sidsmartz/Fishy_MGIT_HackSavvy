let highlightedElements = [];

function scanPage() {
  // Add click listener to the document to detect div clicks
  document.addEventListener("click", (event) => {
    const div = event.target.closest("div");
    if (div && !highlightedElements.includes(div)) {
      // Apply light blue border with glow and low opacity
      div.style.outline = "2px solid rgba(173, 216, 230, 0.5)"; // Light blue with 50% opacity
      div.style.boxShadow = "0 0 8px rgba(173, 216, 230, 0.7)"; // Glow effect
      highlightedElements.push(div);
      analyzeContent(div); // Analyze only the clicked div
    }
  });

  alert("Click on any div on the page to check its validity.");
}

async function analyzeContent(element) {
  const text = element.innerText.trim();
  if (!text) return;

  const response = await fetch("http://localhost:5000/phishing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();
  const isPhishing = data.phishing_detected;
  const probability = data.probability;

  const popup = document.createElement("div");
  popup.style.position = "absolute";
  popup.style.background = isPhishing
    ? "rgba(255, 0, 0, 0.8)"
    : "rgba(0, 255, 0, 0.8)";
  popup.style.color = "#fff";
  popup.style.padding = "5px 10px";
  popup.style.borderRadius = "5px";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "9999";

  popup.innerText = isPhishing
    ? `⚠️ Phishing detected (Probability: ${probability}%)`
    : `✅ Safe (Probability: ${probability}%)`;

  document.body.appendChild(popup);

  const rect = element.getBoundingClientRect();
  popup.style.top = `${window.scrollY + rect.top - 30}px`;
  popup.style.left = `${window.scrollX + rect.left}px`;

  setTimeout(() => popup.remove(), 4000);
}

if (!window.hasRun) {
  scanPage();
  window.hasRun = true;
}
