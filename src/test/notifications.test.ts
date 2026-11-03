import { beforeEach, describe, expect, it } from "vitest";
import { getUser, saveUser, type GambiItem, type GambiUser } from "@/lib/gambi";
import { buildNotifications } from "@/lib/notifications";

const user: GambiUser = { name: "أحمد", level: "جامعي", interests: ["برمجة"], role: "student" };
const now = new Date("2026-10-19T20:46:00Z");
const item: GambiItem = { id: 100, title: "ورشة", type: "event", field: "برمجة", time: "2026-10-20T15:00:00Z", organizer: "أحمد", placeName: "أسوان", lat: 24.08, lng: 32.89, description: "", isVerified: false };

describe("account and notifications", () => {
  beforeEach(() => localStorage.clear());
  it("saves account name, education and interests", () => {
    saveUser({ ...user, name: "مريم", level: "ثانوي", interests: ["تصميم UI/UX"] });
    expect(getUser()).toMatchObject({ name: "مريم", level: "ثانوي", interests: ["تصميم UI/UX"] });
  });
  it("matches event notifications to the student's interests", () => {
    expect(buildNotifications(user, [item, { ...item, id: 101, field: "تطوعي" }], now).map((n) => n.itemId)).toEqual([100]);
  });
  it("does not expose pending events to students", () => {
    expect(buildNotifications(user, [{ ...item, status: "pending" }], now)).toEqual([]);
  });
  it("links pending review notifications for organizers", () => {
    expect(buildNotifications({ ...user, role: "organizer" }, [{ ...item, status: "pending" }], now)[0]?.kind).toBe("pending");
  });
  it("persists read state after reloading the account", () => {
    const [notification] = buildNotifications(user, [item], now);
    if (!notification) throw new Error("Expected notification");
    saveUser({ ...user, readNotificationIds: [notification.id] });
    const stored = getUser();
    if (!stored) throw new Error("Expected account");
    expect(buildNotifications(stored, [item], now)[0]?.read).toBe(true);
  });
  it("turns notifications off with the account preference", () => {
    expect(buildNotifications({ ...user, notificationsEnabled: false }, [item], now)).toEqual([]);
  });
  it("excludes past events and events beyond seven days", () => {
    expect(buildNotifications(user, [{ ...item, time: "2026-10-18T15:00:00Z" }, { ...item, id: 101, time: "2026-10-27T15:00:00Z" }], now)).toEqual([]);
  });
});