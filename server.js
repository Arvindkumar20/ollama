import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import axios from "axios";
import ImagePig from "imagepig";

const app = express();
app.use(cors(""));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();
    console.log(data);
    res.json({ reply: data.response });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Something went wrong",
        error: error.message,
        errors: error,
      });
  }
});

const imagepig = ImagePig(process.env.IMAGEPIG_API_KEY);

app.get("/generate-image", async (req, res) => {
  try {
    const prompt = req.params.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // generate image using SDK
    const result = await imagepig.xl(prompt);

    // result contains image URL internally
    const imageUrl = result.url || result.image_url;

    // stream image instead of buffer
    const imageResponse = await axios.get(imageUrl, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", "image/jpeg");

    imageResponse.data.pipe(res);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  return res.json({
    message: "ok",
  });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Backend running on http://localhost:3000");
});
