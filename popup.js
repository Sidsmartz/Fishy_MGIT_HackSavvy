console.log("FishyGuard Popup Loaded");

const API_URL = "http://localhost:3000";

// ✅ Ensure script runs after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  function addEventListenerIfExists(id, event, callback) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener(event, callback);
    } else {
      console.warn(`⚠️ Element with id "${id}" not found.`);
    }
  }

  // ✅ Scan page for phishing & deepfakes
  addEventListenerIfExists("scan", "click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
  });

  // ✅ Show upload section
  addEventListenerIfExists("upload", "click", () => {
    document.getElementById("drag-drop-container").style.display = "block";
  });

  // ✅ Handle file selection for deepfake detection
  addEventListenerIfExists("drag-drop-container", "click", () => {
    document.getElementById("file-input").click();
  });

  addEventListenerIfExists("file-input", "change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload-video`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(`Result: ${data.deepfake_detected ? "Fake" : "Not Fake"} | Confidence: ${data.confidence}%`);
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to analyze video.");
    }
  });

  // ✅ Handle tab switching
  addEventListenerIfExists("find-tab", "click", () => showSection("find-section"));
  addEventListenerIfExists("report-tab", "click", () => showSection("report-section"));
  addEventListenerIfExists("redeem-tab", "click", () => showSection("redeem-section"));

  function showSection(id) {
    document.querySelectorAll(".section").forEach(section => section.style.display = "none");
    document.getElementById(id).style.display = "block";
  }

  // ✅ Handle phishing report submission
  addEventListenerIfExists("report-btn", "click", async () => {
    const reporterEmail = document.getElementById("reporter-email").value.trim();
    const phisherEmail = document.getElementById("phisher-email").value.trim();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const attackType = document.getElementById("attack").value.trim();

    if (!reporterEmail || !phisherEmail || !name || !attackType) {
      alert("Please fill in all required fields.");
      return;
    }

    const reportData = {
      reporter_email: reporterEmail,
      phisher_email: phisherEmail,
      name: name,
      phone: phone,
      attackType: attackType
    };

    try {
      const response = await fetch(`${API_URL}/report-phisher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error reporting phisher:", error);
    }
  });

  // ✅ Handle finding reported phishers
  addEventListenerIfExists("find-btn", "click", async () => {
    const query = document.getElementById("find-input").value.trim();
    if (!query) return alert("Enter an email, phone number, or name.");

    try {
      const response = await fetch(`${API_URL}/find-phishers?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      alert(`Found ${data.length} reports:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Error finding phishers:", error);
    }
  });

  // ✅ Handle redeeming rewards
  addEventListenerIfExists("redeem-btn", "click", async () => {
    const email = document.getElementById("redeem-email").value.trim();
    if (!email) return alert("Enter your email.");

    try {
      const response = await fetch(`${API_URL}/redeem-rewards?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      alert(`You have ${data.points} points.`);
    } catch (error) {
      console.error("Error redeeming rewards:", error);
    }
  });
});
