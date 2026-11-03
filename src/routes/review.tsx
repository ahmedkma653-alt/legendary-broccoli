import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight, BadgeCheck, CalendarClock, CheckCircle2, Clock3, Hourglass, Inbox, MapPin, ShieldCheck, Trash2,
} from "lucide-react";
import { Backdrop, Footer, Logo } from "@/components/Backdrop";
import { getCustomItems, getRelativeTime, updateCustomItem, type GambiItem } from "@/lib/gambi";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "مراجعة المنشورات | جنبي" },
      { name: "description", content: "راجع وفعّل الايفنتات وأماكن المذاكرة اللي اتنشرت على جنبي قبل ما تظهر لكل طلاب أسوان." },
      { property: "og:title", content: "مراجعة المنشورات | جنبي" },
      { property: "og:description", content: "واجهة مراجعة وتفعيل المنشورات المعلقة على جنبي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Review,
});

function Review() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [items, setItems] = useState<GambiItem[]>([]);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("gambi_user") || "null");
      if (!u || u.role !== "organizer") {
        nav({ to: u ? "/" : "/login" });
        return;
      }
      setOk(true);
      setItems(getCustomItems());
    } catch {
      nav({ to: "/login" });
    }
  }, [nav]);

  const refresh = () => setItems(getCustomItems());
  const approve = (id: number) => { updateCustomItem(id, { status: "approved", isVerified: true }); refresh(); };
  const remove = (id: number) => {
    localStorage.setItem("gambi_custom_items", JSON.stringify(getCustomItems().filter((i) => i.id !== id)));
    refresh();
  };

  if (!ok) return <div className="min-h-screen"><Backdrop /></div>;

  const pending = items.filter((i) => i.status !== "approved");
  const approved = items.filter((i) => i.status === "approved");
  const shown = tab === "pending" ? pending : approved;

  return (
    <div dir="rtl" className="min-h-screen">
      <Backdrop />
      <header className="sticky top-0 z-[1000] border-b border-glass-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Logo />
          <Link to="/" className="press flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-bold">
            <ArrowRight className="h-4 w-4" /> رجوع للرئيسية
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="animate-fade-up">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold md:text-4xl">
            <ShieldCheck className="h-8 w-8 text-gold" /> مراجعة المنشورات
          </h1>
          <p className="mt-2 text-muted-foreground">راجع اللي اتنشر وفعّله عشان يظهر لكل طلاب أسوان، أو امسحه لو مش حقيقي.</p>
        </section>

        <div className="mt-6 flex gap-2">
          <button onClick={() => setTab("pending")} className={`press flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${tab === "pending" ? "border-gold bg-gold/10 text-gold" : "border-glass-border bg-glass text-muted-foreground"}`}>
            <Hourglass className="h-4 w-4" /> في الانتظار <span className="font-mono">{pending.length}</span>
          </button>
          <button onClick={() => setTab("approved")} className={`press flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition ${tab === "approved" ? "border-success bg-success/10 text-success" : "border-glass-border bg-glass text-muted-foreground"}`}>
            <BadgeCheck className="h-4 w-4" /> مفعّلة <span className="font-mono">{approved.length}</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {shown.length === 0 ? (
            <div className="glass flex flex-col items-center p-12 text-center">
              <div className="relative mb-4 grid h-24 w-24 place-items-center rounded-full bg-gold/10">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/10" />
                <Inbox className="h-10 w-10 text-gold" />
              </div>
              <p className="font-display text-lg font-bold">
                {tab === "pending" ? "مفيش منشورات مستنية المراجعة 🎉" : "لسه مفيش منشورات مفعّلة"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "pending" ? "أي ايفينت جديد بينتشر هيظهر هنا فوراً." : "فعّل منشور من تاب الانتظار وهيظهر هنا."}
              </p>
            </div>
          ) : (
            shown.map((i, idx) => (
              <article key={i.id} className="glass glass-hover animate-fade-up p-5" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${i.type === "event" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>
                    {i.type === "event" ? i.field : "مكان مذاكرة"}
                  </span>
                  {i.time && (
                    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
                      <Clock3 className="h-3 w-3" /> {getRelativeTime(i.time).replace(" 🔴", "")}
                    </span>
                  )}
                  {i.status === "approved" && (
                    <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                      <CheckCircle2 className="h-3 w-3" /> مفعّل
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-extrabold leading-snug">{i.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{i.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {i.placeName}</span>
                  {i.time && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Date(i.time).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  )}
                  <span>المنظم: {i.organizer}</span>
                </div>
                {i.proofLink && (
                  <p className="mt-2 truncate text-xs text-muted-foreground" dir="ltr" style={{ textAlign: "right" }}>
                    الدليل: {i.proofLink}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 border-t border-glass-border pt-4">
                  {i.status !== "approved" && (
                    <button onClick={() => approve(i.id)} className="press flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
                      <CheckCircle2 className="h-4 w-4" /> فعّله دلوقتي
                    </button>
                  )}
                  <button onClick={() => remove(i.id)} className="press flex items-center gap-2 rounded-xl bg-destructive/10 px-5 py-2.5 text-sm font-bold text-destructive hover:bg-destructive hover:text-primary-foreground">
                    <Trash2 className="h-4 w-4" /> امسحه
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
