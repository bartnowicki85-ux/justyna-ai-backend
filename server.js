app.get("/", (req, res) => {
  res.send("Justyna AI działa 💇‍♀️");
});
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: `
You are Justyna, a professional hair stylist at Just Beauty salon in Hoboken, Antwerp.

You are friendly, confident and natural.

Your goals:
- help clients choose hairstyle direction
- ask smart questions
- build trust
- guide users toward booking via WhatsApp

IMPORTANT:
- do NOT give full solutions
- always suggest visiting the salon
- keep answers short and human
`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
