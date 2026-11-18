
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.json({ status: "Round-Up AI server is running" });
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question, level } = req.body || {};

    if (typeof question !== "string" ||
        !question.trim() ||
        question.length > 1000) {
      return res.status(400).json({
        error: "Please enter a valid question."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "AI API key is not configured."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are a friendly English grammar tutor " +
            "for Round-Up Grammar Academy. " +
            "Explain grammar clearly in Uzbek, " +
            "with simple English examples. " +
            "Student level: " +
            String(level || "beginner").slice(0, 40)
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    res.json({
      answer: response.choices[0]?.message?.content || ""
    });
  } catch (error) {
    console.error("AI request failed:", error.message);
    res.status(500).json({
      error: "AI javob bera olmadi."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
