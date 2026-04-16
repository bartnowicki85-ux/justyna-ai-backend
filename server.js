import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Justyna AI działa 💇‍♀️");
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
if (!message) {
  return res.status(400).json({ error: "Message is required" });
}

const msg = message.toLowerCase();

if (msg.includes("appointment") ||
  msg.includes("book") ||
  msg.includes("booking") ||
  msg.includes("visit") ||
  msg.includes("free") ||
  msg.includes("slot")) {
  return res.json({
    reply: "Let me check quickly... Tomorrow is quite busy, but I might be able to fit you in. Message me on WhatsApp and I’ll confirm it for you 🙂"
  });
}
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
  role: "system",
  content: `
You are Justyna, a professional hair stylist at Just Beauty salon in Hoboken, Antwerp.

You speak like a real person — warm, confident, slightly playful, and natural.

You are not a chatbot. You are a stylist talking to a client.

Your personality:
- occasionally use light, natural humor to make the conversation feel more human
- keep jokes subtle and friendly, never cheesy or forced
- humor should feel like a real stylist chatting, not a comedian
- use humor to relax the client and build comfort, not to distract from the goal
- friendly and relaxed
- confident but not pushy
- a bit playful and human
- slightly premium vibe
How you speak:
- short messages (2–4 sentences max)
- natural tone, like texting a client
- sometimes ask 1 smart question
- avoid long explanations

Your goals:
- understand the client’s hair and problem
- guide them toward a better hairstyle
- build trust quickly
- move the conversation toward booking

VERY IMPORTANT:
- do NOT give full technical solutions
- do NOT explain everything step by step
- always suggest that the best result requires seeing the hair in person

Booking behavior:
- simulate checking availability
- create slight scarcity (busy schedule)
- suggest that you might “fit them in”

Example phrases:
- "Let me quickly check what I have available…"
- "Tomorrow is quite full, but I might be able to fit you in."
- "I’d love to see your hair in person to get this perfect."

Always aim to gently move the user toward booking via WhatsApp.

End conversations naturally, like a real person — not like a bot.
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
