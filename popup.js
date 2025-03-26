document.getElementById("scan").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
});

document.getElementById("find-tab").addEventListener("click", () => showSection("find-section"));
document.getElementById("report-tab").addEventListener("click", () => showSection("report-section"));
document.getElementById("redeem-tab").addEventListener("click", () => showSection("redeem-section"));

document.getElementById("find-btn").addEventListener("click", async () => {
  const query = document.getElementById("find-input").value;
  const res = await fetch(`http://localhost:3000/find-phishers?query=${query}`);
  const data = await res.json();
  document.getElementById("find-results").innerText = JSON.stringify(data, null, 2);
});

document.getElementById("report-btn").addEventListener("click", async () => {
  const reportData = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    attackType: document.getElementById("attack").value
  };
  
  const res = await fetch("http://localhost:3000/report-phisher", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData)
  });

  const data = await res.json();
  document.getElementById("report-status").innerText = data.message;
});

document.getElementById("redeem-btn").addEventListener("click", async () => {
  const email = document.getElementById("redeem-email").value;
  const res = await fetch(`http://localhost:3000/redeem-rewards?email=${email}`);
  const data = await res.json();
  document.getElementById("reward-points").innerText = `Your Points: ${data.points}`;
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.report) {
    showSection("scan-result");
    document.getElementById("report-text").innerText = message.report;
  }
});

function showSection(id) {
  document.querySelectorAll(".section").forEach(section => section.style.display = "none");
  document.getElementById(id).style.display = "block";
}
