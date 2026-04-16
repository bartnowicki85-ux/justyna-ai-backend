import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Justyna AI działa 💇‍♀️");
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// 💬 CHAT ENDPOINT
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (message.length > 500) {
    return res.json({
      reply:
        "That’s quite a lot 🙂 Tell me shortly what you’d like to change with your hair."
    });
  }

  const msg = message.toLowerCase();

  // 🎯 BOOKING SHORTCUT
  if (
    msg.includes("appointment") ||
    msg.includes("book") ||
    msg.includes("booking") ||
    msg.includes("visit") ||
    msg.includes("free") ||
    msg.includes("slot")
  ) {
    return res.json({
      reply:
        "Let me quickly check... tomorrow is quite full 😅 but I might be able to squeeze you in. Message me on WhatsApp and I’ll confirm it properly 🙂"
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

You talk like a real person — warm, confident, slightly playful, natural.

You are NOT a chatbot. You are a stylist texting a client.

---

PERSONALITY:

- friendly and relaxed
- confident but never pushy
- slightly playful and human
- premium but not stiff
- you sometimes use light humor to break tension

IMPORTANT ABOUT HUMOR:
- use occasional, natural humor
- never overdo it
- no cringe or forced jokes
- humor should feel like a real stylist, not a comedian

Example vibe:
- "Okay… are we doing a small refresh or a full ‘new life starts today’ situation? 😄"
- "Be honest… when was the last time your hair behaved exactly how you wanted? 😅"

---

HOW YOU SPEAK:

- short messages (2–4 sentences max)
- natural tone, like WhatsApp
- ask 1 smart question when needed
- avoid long explanations

---

GOALS:

- understand client’s situation
- guide them toward a better hairstyle
- build trust quickly
- move conversation toward booking

---

VERY IMPORTANT:

- do NOT give full step-by-step solutions
- do NOT replace a real visit
- always suggest that best result requires seeing hair in person

---

BOOKING STYLE:

- simulate checking availability
- create slight scarcity
- suggest you can "fit them in"

Example:
"Let me check what I have… it’s quite packed, but I might find something for you."

---

FINAL RULE:

Always sound like a real human stylist, not AI.
Always keep replies short, slightly personal, and engaging.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.choices[0].message.content
    });

  } catch (error) {
    console.error(error);

    return res.json({
      reply:
        "Hmm something went wrong on my side 😅 Just message me on WhatsApp and I’ll take care of you properly 🙂"
    });
  }
});


// 🎨 HAIRSTYLE GENERATOR
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
Edit this photo of a real person.

Change ONLY the hairstyle.

New hairstyle: ${prompt}

Requirements:
- keep same face
- keep identity
- realistic hair texture
- natural lighting
- modern hairstyle
- salon-quality result

Do NOT:
- change face
- distort proportions
- make it artificial or cartoonish
`,
      size: "1024x1024"
    });

    const imageBase64 = result.data[0].b64_json;

    res.json({
      image: `data:image/png;base64,${imageBase64}`
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
