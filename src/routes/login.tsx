import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Compass, Loader2, Megaphone, Check } from "lucide-react";
import aswan from "@/assets/aswan-night.jpg";
import { Backdrop, Logo } from "@/components/Backdrop";
import { FIELDS, saveUser, type GambiUser } from "@/lib/gambi";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ادخل جنبي | كل فرص أسوان جنبك" },
      { name: "description", content: "سجل في جنبي واكتشف الايفنتات وأماكن المذاكرة اللي حواليك في أسوان لحظة بلحظة." },
      { property: "og:title", content: "ادخل جنبي | كل فرص أسوان جنبك" },
      { property: "og:description", content: "أول منصة في أسوان بتجمعلك كل الايفنتات وأحسن أماكن المذاكرة." },
      { property: "og:url", content: "https://aswan-study-scout.lovable.app/login" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:site_name", content: "جنبي - Gambi" },
      { property: "og:locale", content: "ar_EG" },
    ],
    links: [
      { rel: "canonical", href: "https://aswan-study-scout.lovable.app/login" },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<GambiUser["level"]>("جامعي");
  const [interests, setInterests] = useState<string[]>([]);
  const [role, setRole] = useState<GambiUser["role"]>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (f: string) =>
    setInterests((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("قولنا اسمك الأول يا بطل");
    if (!interests.length) return setError("اختار مجال واحد على الأقل عشان نرشحلك صح");
    setError("");
    saveUser({ name: name.trim(), level, interests, role });
    setLoading(true);
    setTimeout(() => nav({ to: "/" }), 1500);
  };

  return (
    <div dir="rtl" className="flex min-h-screen">
      <Backdrop />
      {/* Form side (60%) — appears on the right in RTL */}
      <main className="flex w-full items-center justify-center px-6 py-12 lg:w-3/5">
        <form onSubmit={submit} className="w-full max-w-xl animate-fade-up space-y-8">
          <Logo size="lg" />
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              بطل تدور. <span className="text-neon">اللي بتدور عليه.. جنبك.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              أول منصة في أسوان بتجمعلك كل الايفنتات وأحسن أماكن المذاكرة اللي حواليك، لحظة بلحظة.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="font-display font-bold">اسمك ايه يا بطل؟</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="مثلاً: أحمد"
              className="glass w-full rounded-2xl px-5 py-4 text-lg outline-none transition focus:border-primary focus:shadow-glow"
            />
          </label>

          <div className="space-y-2">
            <span className="font-display font-bold">انت في سنة كام؟</span>
            <div className="glass grid grid-cols-2 gap-1 rounded-2xl p-1">
              {(["ثانوي", "جامعي"] as const).map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`press rounded-xl py-3 font-bold transition ${level === l ? "bg-neon text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-display font-bold">شغوف بمجال ايه؟</span>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => {
                const on = interests.includes(f);
                return (
                  <button
                    type="button"
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

          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "student" as const, t: "طالب", s: "عايز أكتشف", I: Compass },
              { v: "organizer" as const, t: "منظم", s: "عايز أنشر ايفينت", I: Megaphone },
            ].map(({ v, t, s, I }) => (
              <button
                type="button"
                key={v}
                onClick={() => setRole(v)}
                className={`glass glass-hover press p-5 text-right ${role === v ? "border-primary! shadow-glow-strong" : ""}`}
              >
                <I className={`mb-3 h-7 w-7 ${role === v ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-display text-xl font-extrabold">{t}</div>
                <div className="text-sm text-muted-foreground">{s}</div>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            disabled={loading}
            className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-neon py-4 font-display text-lg font-extrabold text-primary-foreground shadow-glow-strong hover:brightness-110 disabled:opacity-80"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> جاري تحديد موقعك في أسوان...
              </>
            ) : (
              <>
                ادخل المستقبل <ArrowLeft className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Cinematic side (40%) */}
      <aside className="relative hidden overflow-hidden lg:block lg:w-2/5">
        <img src={aswan} alt="معبد فيلة والنيل في أسوان بالليل" width={1024} height={1536} className="absolute inset-0 h-full w-full scale-110 object-cover [animation:float_30s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/40 to-background/10" />
        <div className="absolute bottom-10 right-10 left-10 glass p-5">
          <div className="flex items-center gap-2 text-sm text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> لايف دلوقتي في أسوان
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold">
            <span className="font-mono text-primary">14</span> فرصة هذا الأسبوع ·{" "}
            <span className="font-mono text-success">6</span> أماكن مذاكرة
          </p>
        </div>
      </aside>
    </div>
  );
}
