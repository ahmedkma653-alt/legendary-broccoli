import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarClock, BookOpen, ShieldCheck, UploadCloud, Loader2, CheckCircle2, Link2 } from "lucide-react";
import { Backdrop, Footer, Logo } from "@/components/Backdrop";
import { PLACES } from "@/data/events";
import { addCustomItem, fakeApi, FIELDS, getUser, type ItemType } from "@/lib/gambi";

export const Route = createFileRoute("/add-event")({
  head: () => ({
    meta: [
      { title: "انشر فرصة جديدة لأسوان | جنبي" },
      { name: "description", content: "انشر ايفينت أو مكان مذاكرة على جنبي ووصله لكل طلاب أسوان." },
      { property: "og:title", content: "انشر فرصة جديدة لأسوان | جنبي" },
      { property: "og:description", content: "منصة واحدة لنشر كل أنشطة الطلاب في أسوان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AddEvent,
});

const field = "glass w-full rounded-2xl! px-4 py-3 outline-none transition focus:border-primary focus:shadow-glow";

function AddEvent() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const [type, setType] = useState<ItemType>("event");
  const [f, setF] = useState({ title: "", field: FIELDS[0] ?? "برمجة", description: "", place: 0, time: "", link: "" });
  const [file, setFile] = useState<File | null>(null);
  const [pledge, setPledge] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "organizer") nav({ to: u ? "/" : "/login" });
    else setOk(true);
  }, [nav]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: k === "place" ? Number(e.target.value) : e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim() || !f.description.trim()) return setError("اكتب الاسم والوصف");
    if (type === "event" && !f.time) return setError("حدد المعاد");
    if (!f.link.trim() && !file) return setError("لازم ترفع دليل: لينك بوست أو صورة التصريح");
    if (!pledge) return setError("لازم توافق على التعهد");
    setError("");
    setSending(true);
    const p = PLACES[f.place];
    if (!p) return setError("اختار مكان صح");
    await fakeApi(null, 1400);
    addCustomItem({
      id: Date.now(), type, title: f.title.trim(), field: type === "spot" ? "مذاكرة" : f.field,
      placeName: p.name, lat: p.lat, lng: p.lng, ...(type === "event" ? { time: f.time } : {}),
      description: f.description.trim(), organizer: getUser()?.name ?? "", isVerified: false,
      status: "pending", proofLink: f.link || file?.name || "",
    });
    setSending(false);
    setDone(true);
  };

  if (!ok) return <div className="min-h-screen"><Backdrop /></div>;

  if (done)
    return (
      <div dir="rtl" className="grid min-h-screen place-items-center px-6">
        <Backdrop />
        <div className="glass animate-fade-up max-w-md p-10 text-center">
          <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/20" />
            <CheckCircle2 className="relative h-20 w-20 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold">استلمناه يا بطل!</h1>
          <p className="mt-3 text-muted-foreground">منشورك دلوقتي في قائمة المراجعة. فعّله بنفسك من صفحة المراجعة وهيظهر فوراً لكل طلاب أسوان.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/review" className="press inline-flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 font-display font-bold text-primary-foreground shadow-glow">
              <ShieldCheck className="h-4 w-4" /> روح لصفحة المراجعة
            </Link>
            <Link to="/" className="press inline-flex rounded-2xl glass px-6 py-3 font-bold">ارجع للرئيسية</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div dir="rtl" className="min-h-screen">
      <Backdrop />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Logo />
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /> رجوع</Link>
      </header>
      <form onSubmit={submit} className="mx-auto max-w-3xl animate-fade-up space-y-6 px-4">
        <h1 className="text-3xl font-extrabold md:text-4xl">انشر فرصة جديدة <span className="text-neon">لأسوان</span></h1>

        <section className="glass space-y-3 p-6">
          <h2 className="font-bold">نوع المنشور</h2>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: "event" as const, l: "ايفينت بمعاد", I: CalendarClock }, { v: "spot" as const, l: "مكان مذاكرة دائم", I: BookOpen }].map(({ v, l, I }) => (
              <button type="button" key={v} onClick={() => setType(v)} className={`press flex items-center justify-center gap-2 rounded-2xl border py-4 font-bold transition ${type === v ? "border-primary bg-primary/10 text-primary shadow-glow" : "border-glass-border text-muted-foreground"}`}>
                <I className="h-5 w-5" /> {l}
              </button>
            ))}
          </div>
        </section>

        <section className="glass grid gap-4 p-6 md:grid-cols-2">
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">{type === "event" ? "اسم الايفينت" : "اسم المكان"}</span><input className={field} value={f.title} onChange={set("title")} placeholder="مثلاً: ورشة React للمبتدئين" /></label>
          {type === "event" && (
            <label className="space-y-2"><span className="text-sm font-bold">المجال</span>
              <select className={`${field} bg-popover`} value={f.field} onChange={set("field")}>{FIELDS.map((x) => <option key={x}>{x}</option>)}</select>
            </label>
          )}
          <label className="space-y-2"><span className="text-sm font-bold">المكان</span>
            <select className={`${field} bg-popover`} value={f.place} onChange={set("place")}>{PLACES.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}</select>
            <span className="block font-mono text-xs text-muted-foreground" dir="ltr">{PLACES[f.place]?.lat}, {PLACES[f.place]?.lng}</span>
          </label>
          {type === "event" && <label className="space-y-2"><span className="text-sm font-bold">المعاد</span><input type="datetime-local" className={`${field} font-mono`} value={f.time} onChange={set("time")} /></label>}
          <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold">الوصف</span><textarea rows={4} className={field} value={f.description} onChange={set("description")} placeholder="احكي للطلبة هيستفيدوا ايه..." /></label>
        </section>

        <section className="glass space-y-4 border-gold/30! p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-7 w-7 shrink-0 text-gold" />
            <div>
              <h2 className="text-lg font-extrabold">إثبات المصداقية (إجباري)</h2>
              <p className="text-sm text-muted-foreground">عشان نمنع الايفنتات الفيك ونحافظ على ثقة الطلاب، لازم ترفع دليل.</p>
            </div>
          </div>
          <div className={`${field} flex items-center gap-2`}>
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <input dir="ltr" className="w-full bg-transparent text-left outline-none" value={f.link} onChange={set("link")} placeholder="https://facebook.com/..." />
          </div>
          <div className="text-center text-xs text-muted-foreground">أو</div>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-glass-border p-8 text-center transition hover:border-primary hover:bg-primary/5"
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0] ?? null); }}>
            <UploadCloud className="h-8 w-8 text-primary" />
            <span className="font-bold">{file ? file.name : "ارفع صورة التصريح/البوستر"}</span>
            <span className="text-xs text-muted-foreground">اسحب الصورة هنا أو دوس للاختيار</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={pledge} onChange={(e) => setPledge(e.target.checked)} className="mt-1 h-5 w-5 accent-primary" />
            <span className="text-sm">أتعهد ان المعلومات دي حقيقية وأنا المسؤول عن تنظيمها.</span>
          </label>
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={sending} className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-neon py-4 font-display text-lg font-extrabold text-primary-foreground shadow-glow-strong disabled:opacity-80">
          {sending ? <><Loader2 className="h-5 w-5 animate-spin" /> بنبعت...</> : "ابعت للمراجعة"}
        </button>
      </form>
      <Footer />
    </div>
  );
}
