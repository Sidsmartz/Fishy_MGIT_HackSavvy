
const divs = document.querySelectorAll("div");
divs.forEach(div => {
  div.style.outline = "2px solid red";
  div.addEventListener("click", async function handler(e) {
    e.stopPropagation();
    e.preventDefault();
    const content = div.innerText.trim();
    const img = div.querySelector("img");
    const video = div.querySelector("video");

    if (img) {
      const blob = await fetch(img.src).then(res => res.blob());
      const formData = new FormData();
      formData.append("image", blob, "image.jpg");
      fetch("http://localhost:3000/upload-image", { method: "POST", body: formData })
        .then(res => res.json()).then(console.log);
    } else if (video && video.src) {
      const blob = await fetch(video.src).then(res => res.blob());
      const formData = new FormData();
      formData.append("video", blob, "video.mp4");
      fetch("http://localhost:3000/upload-video", { method: "POST", body: formData })
        .then(res => res.json()).then(console.log);
    } else if (content) {
      fetch("http://localhost:3000/detect-phishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content })
      })
        .then(res => res.json()).then(console.log);
    }

    div.removeEventListener("click", handler);
  }, { once: true });
});
