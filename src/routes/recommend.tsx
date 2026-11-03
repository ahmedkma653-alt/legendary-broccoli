import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Loader2, MapPin, Ruler, BadgeCheck, Star, BookOpen, ArrowLeft, Clock, Check,
} from "lucide-react";
import { Backdrop, Footer, Logo } from "@/components/Backdrop";
import {
  ASWAN_CENTER, FIELDS, formatDistance, getAllItems, getRelativeTime, getUser, haversine,
  type GambiItem, type GambiUser,
} from "@/lib/gambi";
import { getRecommendations, type RecommendResult } from "@/lib/recommend.functions";

export const Route = createFileRoute("/recommend")({
  head: () => ({
    meta: [
      { title: "جنبي | اقتراحات ذكية مخصصة ليك" },
      { name: "description", content: "قولنا اهتماماتك ووقتك الفاضي، والذكاء الاصطناعي يرشحلك أقرب الفرص وأماكن المذاكرة في أسوان." },
      { property: "og:title", content: "جنبي | اقتراحات ذكية" },
      { property: "og:description", content: "ترشيحات بالذكاء الاصطناعي لأقرب الفرص اللي تناسبك في أسوان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recommend,
});

const TIME_OPTIONS = [
  "دلوقتي حالاً",
  "النهاردة بالليل",
  "بكرة",
  "الويكend الجاي",
  "أي وقت الأسبوع ده",
];

function Recommend() {
  const nav = useNavigate();
  const [user, setUser] = useState<GambiUser | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [freeTime, setFreeTime] = useState<string>(TIME_OPTIONS[0] ?? "دلوقتي حالاً");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [items, setItems] = useState<GambiItem[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      nav({ to: "/login" });
      return;
    }
    setUser(u);
    setInterests(u.interests);
    setItems(getAllItems().filter((i) => i.status !== "pending" && (!i.time || getRelativeTime(i.time) !== "خلص")));
  }, [nav]);

  const toggle = (f: string) =>
    setInterests((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const ask = async () => {
    if (!user || !interests.length) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await getRecommendations({
        data: {
          name: user.name,
          level: user.level,
          interests,
          freeTime,
          items,
          origin: ASWAN_CENTER,
        },
      });
      setResult(res);
    } catch {
      setResult({ intro: "حصلت مشكلة في الاقتراحات.. جرب تاني.", picks: [] });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen"><Backdrop /></div>;

  return (
    <div dir="rtl" className="min-h-screen">
      <Backdrop />
      <header className="sticky top-0 z-[1000] border-b border-glass-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Logo />
          <Link to="/" className="press mr-auto flex items-center gap-1 rounded-xl glass px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> رجوع للخريطة
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="animate-fade-up text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 shadow-glow">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">اقتراحات ذكية مخصصة ليك يا {user.name}</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            قولنا بتحب ايه وفاضي امتى، والذكاء الاصطناعي هيرشحلك أحسن 3 حاجات جنبك.
          </p>
        </section>

        <section className="glass mt-8 space-y-6 p-6">
          <div className="space-y-2">
            <span className="font-display font-bold">اهتماماتك</span>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => {
                const on = interests.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggle(f)}
                    className={`press flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition ${on ? "border-primary bg-primary/10 text-primary shadow-glow" : "border-glass-border bg-glass text-muted-foreground hover:text-foreground"}`}
                  >
                    {on && <Check className="h-3.5 w-3.5" />} {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-2 font-display font-bold"><Clock className="h-4 w-4 text-gold" /> فاضي امتى؟</span>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFreeTime(t)}
                  className={`press rounded-full border px-4 py-2 text-sm transition ${freeTime === t ? "border-gold bg-gold/10 text-gold" : "border-glass-border bg-glass text-muted-foreground hover:text-foreground"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={ask}
            disabled={loading || !interests.length}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-neon py-4 font-display text-lg font-extrabold text-primary-foreground shadow-glow-strong hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> الذكاء الاصطناعي بيفكر...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> رشحلي دلوقتي</>
            )}
          </button>
          {!interests.length && <p className="text-center text-sm text-muted-foreground">اختار مجال واحد على الأقل</p>}
        </section>

        {result && (
          <section className="mt-8 space-y-4">
            <p className="animate-fade-up text-lg font-bold text-primary">{result.intro}</p>
            {result.picks.map((p, i) => {
              const item = byId.get(p.id);
              if (!item) return null;
              const dist = formatDistance(haversine(ASWAN_CENTER.lat, ASWAN_CENTER.lng, item.lat, item.lng));
              return (
                <article key={p.id} className="glass glass-hover animate-fade-up p-5" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.type === "event" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>
                      {item.type === "event" ? item.field : "مكان مذاكرة"}
                    </span>
                    {item.time && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
                        {getRelativeTime(item.time).replace(" 🔴", "")}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold leading-snug">{item.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item.placeName}</span>
                    <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> <span className="font-mono text-foreground">{dist}</span> منك</span>
                    {item.rating && (
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" /><span className="font-mono text-gold">{item.rating}</span></span>
                    )}
                    {item.type === "spot" && <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {item.hours}</span>}
                  </div>
                  <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                    <Sparkles className="ml-1 inline h-3.5 w-3.5" /> {p.reason}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-glass-border pt-4">
                    <span className="flex items-center gap-1 text-sm">
                      {item.organizer}
                      {item.isVerified && <BadgeCheck className="h-4 w-4 text-success" />}
                    </span>
                    <Link to="/" className="press flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground">
                      شوفها على الخريطة <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
            {!result.picks.length && (
              <div className="glass p-8 text-center text-muted-foreground">مفيش اقتراحات مناسبة دلوقتي.. جرب وقت تاني.</div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
