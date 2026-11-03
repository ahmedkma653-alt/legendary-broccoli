import { createServerFn } from "@tanstack/react-start";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { ASWAN_CENTER, formatDistance, getRelativeTime, haversine, type GambiItem } from "./gambi";

export interface RecommendInput {
  name: string;
  level: string;
  interests: string[];
  freeTime: string;
  items: GambiItem[];
  origin: { lat: number; lng: number };
}

export interface Recommendation {
  id: number;
  reason: string;
}

export interface RecommendResult {
  intro: string;
  picks: Recommendation[];
}

function extractText(response: unknown): string {
  const r = response as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof r.output_text === "string" && r.output_text.trim()) return r.output_text;
  const parts: string[] = [];
  for (const item of r.output ?? []) {
    for (const c of item.content ?? []) {
      if (c.type === "output_text" && c.text) parts.push(c.text);
    }
  }
  return parts.join("\n");
}

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data: RecommendInput) => data)
  .handler(async ({ data }): Promise<RecommendResult> => {
    const origin = data.origin ?? ASWAN_CENTER;
    const catalog = data.items.map((i) => ({
      id: i.id,
      type: i.type === "event" ? "فعالية/ورشة" : "مكان مذاكرة",
      title: i.title,
      field: i.field,
      place: i.placeName,
      time: i.time ? getRelativeTime(i.time) : undefined,
      hours: i.hours,
      distance: formatDistance(haversine(origin.lat, origin.lng, i.lat, i.lng)),
      description: i.description,
      tags: i.tags,
    }));

    const prompt = `انت مساعد ذكي في تطبيق "جنبي" لطلاب أسوان. الطالب اسمه ${data.name}، مستواه ${data.level}، اهتماماته: ${data.interests.join("، ")}. الوقت المتاح له: ${data.freeTime}.

ده كتالوج الفرص والأماكن المتاحة حالياً (JSON):
${JSON.stringify(catalog, null, 1)}

اختار أفضل 3 اقتراحات تناسب اهتماماته ووقته وقريبة منه. رد بصيغة JSON فقط بدون أي نص إضافي، بالشكل ده بالظبط:
{"intro":"جملة ترحيب قصيرة بالعامية المصرية تخاطب الطالب باسمه","picks":[{"id":<رقم الـ id من الكتالوج>,"reason":"سبب قصير بالعامية ليه الاقتراح ده مناسب له"}]}
لازم كل id يكون موجود في الكتالوج، ومتقترحش حاجة وقتها خلص.`;

    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        input: prompt,
      });
      const text = extractText(response);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("no json");
      const parsed = JSON.parse(match[0]) as RecommendResult;
      const validIds = new Set(data.items.map((i) => i.id));
      parsed.picks = (parsed.picks ?? []).filter((p) => validIds.has(p.id)).slice(0, 3);
      return parsed;
    } catch (error) {
      if (error instanceof GatewayError) {
        console.error("AI Gateway error:", error.code, error.message);
      } else {
        console.error("Recommendation parse error:", error);
      }
      // Fallback: nearest matching items without AI
      const scored = data.items
        .map((i) => ({
          item: i,
          score:
            (data.interests.includes(i.field) ? 100 : 0) -
            haversine(origin.lat, origin.lng, i.lat, i.lng) / 1000,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      return {
        intro: `يا ${data.name}، دي أقرب حاجات ليك على حسب اهتماماتك:`,
        picks: scored.map(({ item }) => ({
          id: item.id,
          reason: `قريب منك (${formatDistance(haversine(origin.lat, origin.lng, item.lat, item.lng))}) وفي مجال ${item.field}.`,
        })),
      };
    }
  });
