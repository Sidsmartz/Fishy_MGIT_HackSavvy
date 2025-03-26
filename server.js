// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/proxy-phishing", async (req, res) => {
  const flaskRes = await fetch("http://localhost:5000/phishing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });
  const data = await flaskRes.json();
  res.json(data);
});

app.listen(4000, () => console.log("Proxy running on http://localhost:4000"));
