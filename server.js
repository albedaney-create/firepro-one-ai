
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

// السماح بالوصول من كل النطاقات
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =============================
// مسار فحص السيرفر
// =============================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FirePro One AI server is running",
    port: PORT,
  });
});

// =============================
// دالة معالجة طلبات المساعد
// واجهة الويب ترسل: { system, user, lang, mode, standard }
// =============================
async function handleAssistantRequest(req, res) {
  try {
    const {
      system,   // نص النظام القادم من الواجهة (اختياري)
      user,     // رسالة المستخدم (مطلوبة)
      lang = "ar",
      mode = "chat",
      standard = "nfpa",
    } = req.body;

    if (!user || typeof user !== "string") {
      return res.status(400).json({ error: "رسالة غير صالحة." });
    }

    // برومبت أساسي حسب اللغة والمعيار
    const baseSystemPrompt =
      lang === "ar"
        ? `أنت مساعد FirePro One الذكي المتخصص في:
- أنظمة إنذار الحريق
- أنظمة الوقاية
- إدارة المخاطر
- معايير NFPA والكود السعودي ومتطلبات الدفاع المدني

وضع العمل الحالي: ${mode}
المعيار المرجعي: ${standard.toUpperCase()}

أجب بلغة عربية واضحة، بنقاط مرتبة، واشرح الافتراضات عند الحاجة.`
        : `You are the FirePro One AI assistant, specialized in:
- Fire alarm systems
- Fire protection & life safety
- Risk management
- NFPA codes and Saudi local fire/safety code

Current mode: ${mode}
Reference standard: ${standard.toUpperCase()}

Respond in clear, structured English with bullet points and explain assumptions.`;

    // لو فيه system جاي من الواجهة ندمجه مع البرومبت الأساسي
    const systemPrompt =
      system && typeof system === "string"
        ? ${baseSystemPrompt}\n\nAdditional system instructions from UI:\n${system}
        : baseSystemPrompt;

    // إرسال الطلب إلى OpenAI
    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: user,
        },
      ],
    });

    const replyText =
      completion.output?.[0]?.content?.[0]?.text ||
      (lang === "ar"
        ? "تم إنشاء الرد ولكن لم يتم العثور على نص مناسب."
        : "A reply was generated but no text was found.");

    return res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    return res.status(500).json({
      error:
        "حدث خطأ داخلي أثناء الاتصال بنظام الذكاء الاصطناعي. يرجى المحاولة لاحقاً.",
    });
  }
}

// =============================
// مسار /chat الرسمي (تستدعيه الواجهة)
// =============================
app.post("/chat", handleAssistantRequest);

// =============================
// تشغيل السيرفر
// =============================
app.listen(PORT, () => {
  console.log("======================================");
  console.log(🔥 FirePro One AI server running on: ${PORT});
  console.log("======================================");
});
















