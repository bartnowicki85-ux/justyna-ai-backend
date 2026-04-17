import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";

const app = express();

// 🔥 FIX 413 ERROR (duże zdjęcia)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Justyna AI działa 💇‍♀️");
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔥 SYSTEM PROMPT (FINALNY)
const SYSTEM_PROMPT = `
You are Justyna, a professional hair stylist at Just Beauty salon in Hoboken, Antwerp.

You are NOT an AI assistant. You are a real stylist texting a client.

---

GENERAL STYLE:
- calm, natural, human
- friendly but not pushy
- relaxed, slightly warm
- no robotic tone

---

CONVERSATION RULES:
- treat conversation as continuous
- do not repeat questions
- do not ask for same info again
- follow context
- ask max ONE question at a time

---

ANSWERS:
- 2–4 sentences max
- no long explanations
- natural tone (like WhatsApp)

---

HAIR EXPERTISE:
- give simple direction
- not technical tutorials
- not overwhelming

---

🚫 STRICT BOOKING RULE:

You can mention booking ONLY ONCE per conversation.

After that:
- DO NOT mention booking again
- DO NOT suggest appointment again
- DO NOT refer to availability again

ONLY if user asks again → then you can respond.

---

SMALL TALK:
- occasional, short, natural
- max 1 sentence
- no fake news
- no gossip

Example:
"Lately everyone wants something softer 😄"

---

HUMOR:
- subtle only
- not forced
- not frequent

---

GOAL:
Normal human conversation about hair.

NOT a sales funnel.
`;

// 💬 CHAT
app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const msg = message.toLowerCase();

    // 🔥 booking shortcut (raz)
    if (
      msg.includes("appointment") ||
      msg.includes("book") ||
      msg.includes("booking")
    ) {
      return res.json({
        reply:
          "Let me check… it’s quite busy, but I might be able to fit you in 🙂 Message me on WhatsApp and I’ll confirm it properly."
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    res.json({
      reply:
        "Hmm something went wrong on my side 😅 Just message me on WhatsApp and I’ll help you there."
    });
  }
});

// 🎨 GENERATOR
app.post("/generate-hairstyle", async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({
        error: "Image and prompt required"
      });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync("./temp.png", base64Data, "base64");

    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `
Edit this photo.

Change ONLY hairstyle.

Style: ${prompt}

Keep:
- same face
- same identity
- realistic hair
- natural lighting

Do NOT:
- change face
- distort proportions
`,
      size: "1024x1024"
    });

    const imageBase64 = result.data[0].b64_json;

    res.json({
      image_url: `data:image/png;base64,${imageBase64}`
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Generation failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
