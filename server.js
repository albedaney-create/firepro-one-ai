// ================================
// FirePro One AI - Stable Server.js
// (متوافق مع الواجهة ومع أغلب نسخ openai)
// ================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
// Render يعطي PORT من المتغيرات البيئية
const PORT = process.env.PORT || 10000;

// ============= إعداد CORS =================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ============= عميل OpenAI =================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============= فحص السيرفر =================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FirePro One AI server is running",
    port: PORT,
  });
});

// ============= الدالة الرئيسية للمساعد =================
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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error:
          "مفتاح OpenAI غير موجود في متغير البيئة OPENAI_API_KEY على السيرفر.",
      });
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

أجب بلغة عربية واضحة، بنقاط مرتبة، مع عناوين فرعية عند الحاجة.`
        : `You are the FirePro One AI assistant specialized in:
- Fire alarm systems
- Fire protection systems
- Fire risk management
- NFPA standards and local Saudi fire codes

Current mode: ${mode}
Reference standard: ${standard.toUpperCase()}

Respond in clear English, using structured bullet points and headings where helpful.`;

    const systemPrompt =
      system && typeof system === "string"
        ? `${baseSystemPrompt}\n\nAdditional system instructions from UI:\n${system}`
        : baseSystemPrompt;

    // ================= استدعاء OpenAI (نسخة مستقرة) =================
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // يمكنك تغييرها إلى gpt-4.1-mini إن أحببت
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user },
      ],
      temperature: 0.4,
    });

    const replyText =
      completion.choices?.[0]?.message?.content ||
      (lang === "ar"
        ? "تم إنشاء الرد ولكن لم يتم العثور على نص."
        : "Reply generated but no text content was found.");

    return res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    return res.status(500).json({
      error:
        "حدث خطأ داخلي أثناء الاتصال بالذكاء الاصطناعي. حاول مرة أخرى لاحقاً.",
    });
  }
}

// مساران لنفس الدالة: /chat و /api/chat
app.post("/chat", handleAssistantRequest);
app.post("/api/chat", handleAssistantRequest);

// ============= تشغيل السيرفر =================
app.listen(PORT, () => {
  console.log("======================================");
  console.log(`FirePro One AI server is running on port: ${PORT}`);
  console.log("======================================");
});





















