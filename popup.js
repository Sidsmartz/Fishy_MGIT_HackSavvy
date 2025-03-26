console.log("FishyGuard Popup Loaded");

const API_URL = "http://localhost:5000";

// Loading spinner functions
function showSpinner() {
  document.getElementById("loading-spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("loading-spinner").style.display = "none";
}

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
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  });

  // ✅ Handle file upload for deepfake detection
  function handleFileUpload(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_URL}/upload-video`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(
          `Result: ${
            data.deepfake_detected ? "Fake" : "Not Fake"
          } | Confidence: ${data.confidence}%`
        );
      })
      .catch((error) => {
        console.error("Error uploading video:", error);
        alert("Failed to analyze video.");
      });
  }

  // ✅ Show upload section and handle file selection
  addEventListenerIfExists("upload", "click", () => {
    document.getElementById("drag-drop-container").style.display = "block";
    document.getElementById("file-input").focus(); // Focus input for pasting
  });

  // ✅ Handle file selection and paste for deepfake detection
  addEventListenerIfExists("drag-drop-container", "click", () => {
    document.getElementById("file-input").click();
  });

  // File input change handler
  addEventListenerIfExists("file-input", "change", async (event) => {
    await processFile(event.target.files[0]);
  });

  // Paste handler
  addEventListenerIfExists("file-input", "paste", async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    for (let item of items) {
      if (
        item.type.indexOf("image") === 0 ||
        item.type.indexOf("video") === 0
      ) {
        const file = item.getAsFile();
        const extension = item.type.startsWith("image") ? "png" : "mp4";
        const filename = `pasted-media.${extension}`;
        const pastedFile = new File([file], filename, { type: file.type });
        await processFile(pastedFile);
        break; // Process only the first media file
      }
    }
  });

  async function processFile(file) {
    if (!file) return;

    const filename = file.name.toLowerCase();
    const formData = new FormData();
    formData.append("video", file); // For video upload
    formData.append("image", file); // For image upload

    let url;
    let responseField;

    // Determine the correct endpoint based on file extension
    if (filename.endsWith(".mp4")) {
      url = "http://localhost:5002/upload-video";
      responseField = "deepfake_detected";
    } else if (
      filename.endsWith(".png") ||
      filename.endsWith(".jpeg") ||
      filename.endsWith(".jpg")
    ) {
      url = "http://localhost:5001/predict";
      responseField = "prediction";
    } else {
      alert("Invalid input: Please upload a .mp4 video or a .png/.jpeg image");
      return;
    }

    try {
      showSpinner();
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Handle response based on endpoint
      if (url.includes("upload-video")) {
        alert(
          `Result: ${
            data.deepfake_detected ? "Fake" : "Not Fake"
          } | Confidence: ${data.confidence}%`
        );
        console.log("Frame Predictions:", data.frame_predictions);
        console.log("Frame Confidences:", data.frame_confidences);
        console.log("Frame URLs:", data.frame_urls);
      } else {
        alert(
          `Result: ${
            data[responseField] === "fake" ? "Fake" : "Not Fake"
          } | Confidence: ${
            data.confidences
              ? Math.max(data.confidences.real, data.confidences.fake) * 100
              : "N/A"
          }%`
        );
        console.log("Confidences:", data.confidences);
        console.log("Prediction:", data.prediction);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Failed to analyze file.");
    } finally {
      hideSpinner();
    }
  }

  // ✅ Handle tab switching
  addEventListenerIfExists("find-tab", "click", () =>
    showSection("find-section")
  );
  addEventListenerIfExists("report-tab", "click", () =>
    showSection("report-section")
  );
  addEventListenerIfExists("redeem-tab", "click", () =>
    showSection("redeem-section")
  );

  function showSection(id) {
    document
      .querySelectorAll(".section")
      .forEach((section) => (section.style.display = "none"));
    document.getElementById(id).style.display = "block";
  }

  // ✅ Handle phishing report submission
  addEventListenerIfExists("report-btn", "click", async () => {
    const reporterEmail = document
      .getElementById("reporter-email")
      .value.trim();
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
      attackType: attackType,
    };

    try {
      showSpinner();
      const response = await fetch(`${API_URL}/report-phisher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error reporting phisher:", error);
    } finally {
      hideSpinner();
    }
  });

  // ✅ Handle finding reported phishers
  addEventListenerIfExists("find-btn", "click", async () => {
    const query = document.getElementById("find-input").value.trim();
    if (!query) return alert("Enter an email, phone number, or name.");

    try {
      showSpinner();
      const response = await fetch(
        `${API_URL}/find-phishers?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      alert(`Found ${data.length} reports:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error("Error finding phishers:", error);
    } finally {
      hideSpinner();
    }
  });

  // ✅ Handle redeeming rewards
  addEventListenerIfExists("redeem-btn", "click", async () => {
    const email = document.getElementById("redeem-email").value.trim();
    if (!email) return alert("Enter your email.");

    try {
      showSpinner();
      const response = await fetch(
        `${API_URL}/redeem-rewards?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      alert(`You have ${data.points} points.`);
    } catch (error) {
      console.error("Error redeeming rewards:", error);
    } finally {
      hideSpinner();
    }
  });
});
