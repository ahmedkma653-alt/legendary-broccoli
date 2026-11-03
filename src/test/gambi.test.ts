import { describe, expect, it } from "vitest";
import { getRelativeTime, haversine } from "@/lib/gambi";

describe("gambi logic", () => {
  it("haversine: Aswan Corniche to Abu El Reesh is ~7.5km", () => {
    const d = haversine(24.0889, 32.8998, 24.0215, 32.8835);
    expect(d).toBeGreaterThan(7000);
    expect(d).toBeLessThan(8000);
  });
  const now = new Date(2026, 9, 18, 12, 0);
  it("under 30 minutes is 'now'", () => {
    expect(getRelativeTime(new Date(2026, 9, 18, 12, 20).toISOString(), now)).toBe("يبدأ الآن 🔴");
  });
  it("minutes", () => {
    expect(getRelativeTime(new Date(2026, 9, 18, 12, 45).toISOString(), now)).toBe("بعد 45 دقيقة");
  });
  it("tomorrow", () => {
    expect(getRelativeTime(new Date(2026, 9, 19, 16, 0).toISOString(), now)).toBe("بكرة الساعة 4 الضهر");
  });
  it("weekday — Oct 24 2026 is Saturday", () => {
    expect(getRelativeTime(new Date(2026, 9, 24, 19, 0).toISOString(), now)).toBe("يوم السبت");
  });
});
