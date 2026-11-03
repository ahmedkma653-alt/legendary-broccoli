import { SEED_ITEMS } from "@/data/events";

export type ItemType = "event" | "spot";
export interface GambiItem {
  id: number;
  type: ItemType;
  title: string;
  field: string;
  placeName: string;
  lat: number;
  lng: number;
  time?: string;
  description: string;
  organizer: string;
  isVerified: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
  audience?: string;
  hours?: string;
  status?: "pending" | "approved";
  proofLink?: string;
  link?: string;
  schedule?: string[];
  requirements?: string[];
  booking?: string;
}

export interface GambiUser {
  name: string;
  level: "ثانوي" | "جامعي";
  interests: string[];
  role: "student" | "organizer";
  notificationsEnabled?: boolean;
  readNotificationIds?: string[];
}

export const USER_KEY = "gambi_user";
export const CUSTOM_KEY = "gambi_custom_items";

// Center of Aswan city (Corniche) — fallback location
export const ASWAN_CENTER = { lat: 24.0889, lng: 32.8998 };

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} متر`;
  return `${(m / 1000).toFixed(1)} كم`;
}

const DAYS = ["الأحد", "الاتنين", "التلات", "الأربع", "الخميس", "الجمعة", "السبت"];

function hourLabel(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "الصبح" : h < 17 ? "الضهر" : "بالليل";
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${suffix}`;
}

export function getRelativeTime(isoString: string, now: Date = new Date()): string {
  const t = new Date(isoString);
  const diffMin = Math.round((t.getTime() - now.getTime()) / 60000);
  if (diffMin < -180) return "خلص";
  if (diffMin < 30) return "يبدأ الآن 🔴";
  if (diffMin < 60) return `بعد ${diffMin} دقيقة`;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(t) - startOfDay(now)) / 86400000);
  if (dayDiff === 0) {
    const h = Math.round(diffMin / 60);
    return h === 1 ? "بعد ساعة" : h === 2 ? "بعد ساعتين" : `بعد ${h} ساعات`;
  }
  if (dayDiff === 1) return `بكرة الساعة ${hourLabel(t)}`;
  return `يوم ${DAYS[t.getDay()]}`;
}

export function isSoon(iso?: string, now = new Date()): boolean {
  if (!iso) return false;
  const d = (new Date(iso).getTime() - now.getTime()) / 60000;
  return d < 120 && d > -180;
}

export function getUser(): GambiUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as GambiUser) : null;
  } catch {
    return null;
  }
}
export function saveUser(u: GambiUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("gambi-updated"));
}
export function getCustomItems(): GambiItem[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
}
export function addCustomItem(item: GambiItem) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify([...getCustomItems(), item]));
  window.dispatchEvent(new Event("gambi-updated"));
}
export function updateCustomItem(id: number, patch: Partial<GambiItem>) {
  localStorage.setItem(
    CUSTOM_KEY,
    JSON.stringify(getCustomItems().map((i) => (i.id === id ? { ...i, ...patch } : i))),
  );
  window.dispatchEvent(new Event("gambi-updated"));
}
export function getAllItems(): GambiItem[] {
  return [...SEED_ITEMS, ...getCustomItems()];
}

export const fakeApi = <T,>(value: T, ms = 900) =>
  new Promise<T>((res) => setTimeout(() => res(value), ms));

export const FIELDS = ["برمجة", "ذكاء اصطناعي", "ريادة أعمال", "تصميم UI/UX", "فن نوبي", "تطوعي"];
