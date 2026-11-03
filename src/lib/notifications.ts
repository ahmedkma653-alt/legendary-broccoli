import type { GambiItem, GambiUser } from "@/lib/gambi";

export interface GambiNotification {
  id: string;
  itemId: number;
  title: string;
  body: string;
  kind: "event" | "pending" | "approved";
  read: boolean;
  time?: string;
}

export function buildNotifications(user: GambiUser, items: GambiItem[], now = new Date()): GambiNotification[] {
  if (user.notificationsEnabled === false) return [];
  const read = new Set(user.readNotificationIds ?? []);
  const result: GambiNotification[] = [];
  for (const item of items) {
    if (item.status === "pending") {
      if (user.role === "organizer") {
        const id = `pending:${item.id}`;
        result.push({ id, itemId: item.id, title: "منشور مستني المراجعة", body: item.title, kind: "pending", read: read.has(id) });
      }
      continue;
    }
    if (item.status === "approved" && user.role === "organizer" && item.organizer === user.name) {
      const id = `approved:${item.id}`;
      result.push({ id, itemId: item.id, title: "منشورك اتفعّل", body: item.title, kind: "approved", read: read.has(id) });
    }
    if (item.type !== "event" || !item.time || !user.interests.includes(item.field)) continue;
    const diff = new Date(item.time).getTime() - now.getTime();
    if (!Number.isFinite(diff) || diff < 0 || diff > 7 * 86400000) continue;
    const id = `event:${item.id}:${item.time}`;
    result.push({ id, itemId: item.id, title: "فرصة مناسبة لاهتماماتك", body: item.title, kind: "event", time: item.time, read: read.has(id) });
  }
  return result.sort((a, b) => Number(a.read) - Number(b.read) || (a.time ?? "").localeCompare(b.time ?? ""));
}