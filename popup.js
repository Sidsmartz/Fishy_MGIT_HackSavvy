document.getElementById("scan").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
});

document.getElementById("upload").addEventListener("click", () => {
  document.getElementById("drag-drop-container").style.display = "block";
});

document.getElementById("drag-drop-container").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3000/upload-video", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  alert(`Result: ${data.deepfake_detected ? "Fake" : "Not Fake"} | Confidence: ${data.confidence}`);
});

document.getElementById("find-tab").addEventListener("click", () => showSection("find-section"));
document.getElementById("report-tab").addEventListener("click", () => showSection("report-section"));
document.getElementById("redeem-tab").addEventListener("click", () => showSection("redeem-section"));

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => section.style.display = "none");
  document.getElementById(id).style.display = "block";
}
