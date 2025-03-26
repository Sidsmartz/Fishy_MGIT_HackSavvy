let highlightedElements = [];

function scanPage() {
  document.querySelectorAll("div").forEach((div) => {
    if (!div.innerText.trim()) return;
    div.style.outline = "2px solid red";
    highlightedElements.push(div);
    div.addEventListener("click", () => analyzeContent(div));
  });

  alert("Select anything on the page to check its validity.");
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
  const phishingScore = data.phishing_detected;
  console.log(data); // This is already a number (percentage)

  const popup = document.createElement("div");
  popup.style.position = "absolute";
  popup.style.background =
    phishingScore >= 50 ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 255, 0, 0.8)";
  popup.style.color = "#fff";
  popup.style.padding = "5px 10px";
  popup.style.borderRadius = "5px";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "9999";

  popup.innerText =
    phishingScore >= 50
      ? `⚠️ Phishing detected (Probability: ${phishingScore}%)`
      : `✅ Safe (Probability: ${phishingScore}%)`;

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
