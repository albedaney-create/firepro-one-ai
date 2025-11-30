
// ================================
// FirePro One AI - Final Server.js (متوافق مع الواجهة)
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =============================
// فحص السيرفر
// =============================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FirePro One AI server is running",
    port: PORT,
  });
});

// =============================
// الدالة الرئيسية
// =============================
async function handleAssistantRequest(req, res) {
  try {
    const {
      system,
      user,
      lang = "ar",
      mode = "chat",
      standard = "nfpa",
    } = req.body;

    if (!user || typeof user !== "string") {
      return res.status(400).json({ error: "رسالة غير صالحة." });
    }

    const baseSystemPrompt =
      lang === "ar"
        ? `أنت مساعد FirePro One الذكي المتخصص في:
- أنظمة إنذار الحريق
- أنظمة الوقاية
- إدارة المخاطر
- معايير NFPA والكود السعودي ومتطلبات الدفاع المدني

وضع العمل الحالي: ${mode}
المعيار المرجعي: ${standard.toUpperCase()}

أجب بلغة عربية واضحة، بنقاط مرتبة.`
        : `You are the FirePro One AI assistant specialized in fire alarm systems and NFPA codes.
Mode: ${mode}
Standard: ${standard.toUpperCase()}
Respond in clear English with bullet points.`;
const systemPrompt =
  system && typeof system === "string"
    ? ${baseSystemPrompt}\n\nAdditional system instructions from UI:\n${system}
    : baseSystemPrompt;

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user },
      ],
    });

    const replyText =
      completion.output?.[0]?.content?.[0]?.text ||
      (lang === "ar"
        ? "تم إنشاء الرد ولكن لا يوجد نص."
        : "Reply generated but no text found.");

    return res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    return res.status(500).json({
      error:
        "حدث خطأ داخلي أثناء الاتصال بالذكاء الاصطناعي. حاول لاحقاً.",
    });
  }
}

app.post("/chat", handleAssistantRequest);

app.listen(PORT, () => {
  console.log("======================================");
  console.log(FirePro One AI Server is running on port: ${PORT});
  console.log("======================================");
});

















