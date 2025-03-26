chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "reopenPopup") {
      chrome.action.openPopup();
    }
  });
  