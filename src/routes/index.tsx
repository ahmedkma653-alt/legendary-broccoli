import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bell, Search, LocateFixed, MapPin, Ruler, BadgeCheck, ArrowLeft, Star, VolumeX, Wifi,
  BookOpen, Plus, Navigation, Radio, SearchX, Loader2, Sparkles, ShieldCheck,
} from "lucide-react";
import { Backdrop, Footer, Logo } from "@/components/Backdrop";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { useGambiAccount } from "@/hooks/use-gambi-account";
import {
  ASWAN_CENTER, fakeApi, formatDistance, getAllItems, getRelativeTime, getUser, haversine, isSoon,
  type GambiItem, type GambiUser,
} from "@/lib/gambi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "جنبي | إيه أهم حاجة بتحصل جنبك دلوقتي في أسوان؟" },
      { name: "description", content: "خريطة لايف لكل الورش والهاكاثونات وأماكن المذاكرة حواليك في أسوان." },
      { property: "og:title", content: "جنبي | مركز القيادة" },
      { property: "og:description", content: "خريطة لايف لكل الفرص وأماكن المذاكرة حواليك في أسوان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type Row = GambiItem & { distance: number };
const FIELD_FILTERS = [
  { k: "برمجة", l: "برمجة" }, { k: "ذكاء اصطناعي", l: "AI" }, { k: "ريادة أعمال", l: "بيزنس" },
  { k: "تصميم UI/UX", l: "تصميم" }, { k: "تطوعي", l: "تطوعي" }, { k: "فن نوبي", l: "فن نوبي" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "صباح الخير" : "مساء الخير";
}

function Home() {
  const nav = useNavigate();
  const { unreadCount } = useGambiAccount();
  const [user, setUser] = useState<GambiUser | null>(null);
  const [items, setItems] = useState<GambiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"all" | "live" | "spot">("all");
  const [field, setField] = useState<string | null>(null);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);
  const [sorting, setSorting] = useState(false);
  const [focusId, setFocusId] = useState<number | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      nav({ to: "/login" });
      return;
    }
    setUser(u);
    fakeApi(getAllItems().filter((i) => i.status !== "pending"), 700).then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, [nav]);

  const origin = me ?? ASWAN_CENTER;
  const rows: Row[] = useMemo(() => {
    const s = q.trim();
    let r = items
      .filter((i) => !i.time || getRelativeTime(i.time) !== "خلص")
      .map((i) => ({ ...i, distance: haversine(origin.lat, origin.lng, i.lat, i.lng) }));
    if (mode === "live") r = r.filter((i) => i.type === "event" && isSoon(i.time));
    if (mode === "spot") r = r.filter((i) => i.type === "spot");
    if (field) r = r.filter((i) => i.field === field);
    if (s) r = r.filter((i) => i.title.includes(s) || i.description.includes(s) || i.placeName.includes(s));
    if (me) r.sort((a, b) => a.distance - b.distance);
    else r.sort((a, b) => (a.time ?? "9999").localeCompare(b.time ?? "9999"));
    return r;
  }, [items, q, mode, field, me, origin.lat, origin.lng]);

  const goldenNear = rows.filter((r) => r.type === "event" && r.distance < 1000).length || 3;

  const sortNearest = () => {
    setSorting(true);
    const done = (p: { lat: number; lng: number }) => {
      setMe(p);
      setSorting(false);
    };
    if (!navigator.geolocation) return done(ASWAN_CENTER);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // If the user is outside Aswan, simulate a location on the Corniche
        done(haversine(p.lat, p.lng, ASWAN_CENTER.lat, ASWAN_CENTER.lng) > 40000 ? ASWAN_CENTER : p);
      },
      () => done(ASWAN_CENTER),
      { timeout: 6000 },
    );
  };

  if (!user) return <div className="min-h-screen"><Backdrop /></div>;

  return (
    <div dir="rtl" className="min-h-screen">
      <Backdrop />
      <header className="sticky top-0 z-[1000] border-b border-glass-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Logo />
          <div className="glass relative mx-auto flex max-w-lg flex-1 items-center rounded-2xl! px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="دور على ورشة برمجة..." className="w-full bg-transparent px-3 py-2.5 outline-none placeholder:text-muted-foreground" />
          </div>
          <Link to="/recommend" aria-label="اقتراحات ذكية" className="press flex items-center gap-2 rounded-xl bg-gold/10 px-4 py-2.5 text-sm font-bold text-gold shadow-glow hover:bg-gold hover:text-primary-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">رشحلي بذكاء</span>
          </Link>
          {user.role === "organizer" && (
            <Link to="/review" aria-label="مراجعة المنشورات" className="press flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm font-bold text-gold hover:bg-gold hover:text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">المراجعة</span>
            </Link>
          )}
          <Button asChild variant="outline" size="icon" className="relative h-10 w-10 shrink-0" title="الإشعارات">
            <Link to="/notifications" aria-label="الإشعارات"><Bell />{unreadCount > 0 && <span className="absolute -top-2 -left-2 grid h-5 min-w-5 place-items-center rounded-full bg-live px-1 text-xs text-foreground ring-2 ring-background">{unreadCount}</span>}</Link>
          </Button>
          <Button asChild size="icon" className="h-10 w-10 shrink-0 rounded-full bg-neon font-display font-extrabold shadow-glow" title="حسابي">
            <Link to="/account" aria-label="حسابي">{user.name[0]}</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4">
        <section className="animate-fade-up py-8">
          <h1 className="text-3xl font-extrabold md:text-4xl">{greeting()} يا {user.name} 👋</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            فيه <span className="font-mono font-bold text-gold">{goldenNear}</span> فرص ذهبية جنبك دلوقتي في أقل من{" "}
            <span className="font-mono">1</span> كم. متضيعهاش.
          </p>
        </section>

        <div className="sticky top-[65px] z-[900] -mx-4 mb-6 flex items-center gap-3 bg-background/70 px-4 py-3 backdrop-blur-xl">
          <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
            <Pill on={mode === "all" && !field} onClick={() => { setMode("all"); setField(null); }}>الكل</Pill>
            <Pill on={mode === "live"} onClick={() => setMode(mode === "live" ? "all" : "live")}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-live" /> يحدث الآن
            </Pill>
            <Pill on={mode === "spot"} onClick={() => setMode(mode === "spot" ? "all" : "spot")}>
              <BookOpen className="h-3.5 w-3.5" /> أماكن مذاكرة
            </Pill>
            <span className="mx-1 h-6 w-px shrink-0 bg-glass-border" />
            {FIELD_FILTERS.map((f) => (
              <Pill key={f.k} on={field === f.k} onClick={() => setField(field === f.k ? null : f.k)}>{f.l}</Pill>
            ))}
          </div>
          <button onClick={sortNearest} disabled={sorting} className={`press flex shrink-0 items-center gap-2 rounded-2xl px-5 py-2.5 font-display font-bold shadow-glow ${me ? "border border-primary bg-primary/10 text-primary" : "bg-neon text-primary-foreground"}`}>
            {sorting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            <span className="hidden sm:inline">رتب بالأقرب ليا</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="relative h-[420px] overflow-hidden rounded-3xl border border-primary/25 shadow-glow lg:col-span-3 lg:h-[600px]">
            <MapView items={rows} me={me} focusId={focusId} />
            <div className="pointer-events-none absolute top-4 right-4 z-[500] flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-live backdrop-blur">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> LIVE
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] space-y-1.5 rounded-2xl bg-background/80 px-4 py-3 text-sm backdrop-blur">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow" /> ايفنت</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" /> مذاكرة</div>
              {me && <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-gold" /> انت</div>}
            </div>
          </div>

          <div className="scrollbar-neon space-y-4 lg:col-span-2 lg:max-h-[600px] lg:overflow-y-auto lg:pl-2">
            {loading ? (
              [0, 1, 2].map((i) => <div key={i} className="glass h-48 animate-pulse" />)
            ) : rows.length === 0 ? (
              <div className="glass flex flex-col items-center p-10 text-center">
                <div className="relative mb-4 grid h-24 w-24 place-items-center rounded-full bg-primary/10">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
                  <SearchX className="h-10 w-10 text-primary" />
                </div>
                <p className="font-display text-lg font-bold">مفيش حاجة هنا دلوقتي.. جرب توسع بحثك</p>
              </div>
            ) : (
              rows.map((r, i) => (
                <div key={`${r.id}-${me ? "n" : "t"}`} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  {r.type === "event" ? <EventCard r={r} onFocus={() => setFocusId(r.id)} /> : <SpotCard r={r} onFocus={() => setFocusId(r.id)} />}
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {user.role === "organizer" && (
        <Link to="/add-event" aria-label="انشر فرصة" className="press fixed bottom-6 left-6 z-[1000] grid h-16 w-16 place-items-center rounded-full bg-neon text-primary-foreground shadow-glow-strong transition hover:scale-110">
          <Plus className="h-8 w-8" strokeWidth={2.5} />
        </Link>
      )}
      <Footer />
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`press flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition ${on ? "border-primary bg-primary/15 text-primary" : "border-glass-border bg-glass text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function EventCard({ r, onFocus }: { r: Row; onFocus: () => void }) {
  const rel = r.time ? getRelativeTime(r.time) : "";
  const soon = isSoon(r.time);
  return (
    <article onMouseEnter={onFocus} className="glass glass-hover p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{r.field}</span>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${soon ? "bg-live/15 text-live" : "bg-secondary text-muted-foreground"}`}>
          {soon && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" />}
          {rel.replace(" 🔴", "")}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold leading-snug">{r.title}</h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.placeName}</span>
        <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> <span className="font-mono text-foreground">{formatDistance(r.distance)}</span> منك</span>
      </div>
      <p className="mt-2 truncate text-sm text-muted-foreground">{r.description}</p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-glass-border pt-4">
        <span className="flex items-center gap-1 text-sm">
          {r.organizer}
          {r.isVerified && <><BadgeCheck className="h-4 w-4 text-success" /><span className="text-xs text-success">موثق</span></>}
        </span>
        <Link to="/events/$id" params={{ id: String(r.id) }} className="press flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground">
          التفاصيل و الحجز <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function SpotCard({ r, onFocus }: { r: Row; onFocus: () => void }) {
  const tagIcon = (t: string) => (t.includes("هدوء") ? <VolumeX className="h-3.5 w-3.5" /> : t.includes("واي") ? <Wifi className="h-3.5 w-3.5" /> : null);
  return (
    <article onMouseEnter={onFocus} className="glass glass-hover p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success"><BookOpen className="h-3 w-3" /> مكان مذاكرة</span>
        <span className="rounded-full border border-success/30 px-3 py-1 text-xs text-success">{r.hours}</span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold leading-snug">{r.title}</h3>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-gold text-gold" /><span className="font-mono text-gold">{r.rating}</span> (<span className="font-mono">{r.reviews}</span> تقييم)</span>
        <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /><span className="font-mono text-foreground">{formatDistance(r.distance)}</span></span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {r.tags?.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{tagIcon(t)}{t}</span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-glass-border pt-4">
        <span className="text-sm text-muted-foreground">{r.audience}</span>
        <a href={`https://www.openstreetmap.org/directions?to=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" className="press flex items-center gap-1 rounded-xl bg-success/10 px-3 py-2 text-sm font-bold text-success hover:bg-success hover:text-primary-foreground">
          أروح ازاي؟ <Navigation className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
