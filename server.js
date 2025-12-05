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
 // =============================
// استدعاء OpenAI مع تحليل حوادث الحرائق
// =============================
const fireIncidentPrompt = `
أنت خبير محترف في تحليل حوادث الحرائق (Fire Investigation)، متمرس بمعايير NFPA 921,
NFPA 72, NFPA 70، والكود السعودي والدفاع المدني. قم بتحليل أي حادث حريق يقدمه
المستخدم عبر الخطوات التالية:

1️⃣ تحليل وصف الحادث:
- تحديد مكان بداية الحريق المحتمل.
- هل السبب كهربائي، ميكانيكي، بشري، سوء تخزين، حرارة، شرر، تماس، مصدر اشتعال؟
- العوامل التي ساعدت على انتشار النيران.

2️⃣ التحليل الزمني للحادث:
- كيف بدأ الحريق؟
- كيف تم اكتشافه؟
- كيف انتشر؟
- كيف تمت الاستجابة الأولية؟

3️⃣ تقييم أنظمة السلامة:
- هل الموقع متوافق مع NFPA والكود السعودي؟
- هل تعمل أنظمة الإنذار؟ الرش الآلي؟ الطفايات؟ الإخلاء؟
- هل فشلت أي منظومة؟ لماذا؟

4️⃣ الأسباب المحتملة:
- قدم 3–5 احتمالات مرتّبة حسب قوة الدليل.

5️⃣ الأخطاء البشرية والفنية:
- أخطاء في التشغيل، الصيانة، التدريب، إجراءات السلامة، التخزين.

6️⃣ التوصيات:
- تحسينات هندسية وتشغيلية.
- تدريب العاملين.
- تحديث أنظمة الإنذار والإطفاء.
- خطوات لتقليل احتمالية تكرار الحادث.

إذا كانت معلومات المستخدم غير واضحة اطلب منه:
نوع المنشأة – المساحة – مكان بداية الحريق – أنظمة الإطفاء المتوفرة – وقت الحادث – الاستجابة.

ابدأ الرد بتحليل قوي وكامل ومنسق.
`;

const completion = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `
      أنت مساعد FirePro One AI متخصص في أنظمة الإطفاء والإنذار والسلامة والكود السعودي.
      دورك مساعدة المستخدم في:
      - إنشاء التقارير الفنية
      - الاستشارات السريعة
      - التدريب والتأهيل
      - تحليل حوادث الحرائق

      إذا كانت رسالة المستخدم تتعلق بـ "تحليل حادث حريق" أو "تحليل أسباب الحريق"
      أو "سبب الحريق" أو وصف تفصيلي لحادث حريق:
      عندها طبّق التعليمات التالية بحذافيرها:

      ${fireIncidentPrompt}

      في بقية الحالات:
      تعامل مع السؤال بشكل طبيعي كـ FirePro One AI Assistant بدون مبالغة أو اختصار مخل،
      وركز دائماً على معايير NFPA والكود السعودي والدفاع المدني.
      `
    },
    {
      role: "user",
      content: userMessage
    }
  ],
  temperature: 0.4,
});

// النص النهائي من المساعد
const replyText =
  completion.choices?.[0]?.message?.content?.trim() ||
  "لم يتم توليد رد نصي من نموذج الذكاء الاصطناعي.";

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






















