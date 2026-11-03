import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Check, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import { Backdrop, Footer } from "@/components/Backdrop";
import { AccountHeader } from "@/components/AccountHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGambiAccount } from "@/hooks/use-gambi-account";
import { FIELDS, getUser, saveUser, USER_KEY, type GambiUser } from "@/lib/gambi";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "حسابي واهتماماتي | جنبي" },
    { name: "description", content: "بيانات حسابك واهتماماتك وتفضيلات الإشعارات على جنبي في أسوان." },
    { property: "og:title", content: "حسابي واهتماماتي | جنبي" },
    { property: "og:description", content: "حسابك على جنبي للفرص وأماكن المذاكرة في أسوان." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Account,
});

function Account() {
  const { user, unreadCount } = useGambiAccount();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<GambiUser["level"]>("جامعي");
  const [interests, setInterests] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    setName(user.name); setLevel(user.level); setInterests(user.interests);
    setEnabled(user.notificationsEnabled !== false);
  }, [user]);
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) { setError("اكتب اسمك بحرفين على الأقل"); return; }
    if (!interests.length) { setError("اختار اهتمام واحد على الأقل"); return; }
    const current = getUser();
    if (!current) return;
    saveUser({ ...current, name: name.trim(), level, interests, notificationsEnabled: enabled });
    setError(""); setMessage("اتحفظت بياناتك بنجاح");
  };
  if (!user) return <Backdrop />;
  return <div dir="rtl" className="min-h-screen"><Backdrop /><AccountHeader />
    <main className="mx-auto max-w-4xl px-4 py-8">
      <section className="flex items-center gap-4 border-b border-glass-border pb-8">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-neon font-display text-2xl font-bold text-primary-foreground shadow-glow">{user.name[0]}</div>
        <div className="min-w-0"><h1 className="text-3xl font-extrabold">حسابي</h1><p className="mt-2 break-words text-muted-foreground">{user.name} · {user.role === "organizer" ? "منظم" : "طالب"} · {user.level}</p></div>
      </section>
      <form onSubmit={save} className="mt-8 space-y-8" onChange={() => { setMessage(""); setError(""); }}>
        <section className="space-y-4"><h2 className="flex items-center gap-2 text-xl font-bold"><UserRound className="text-primary" /> بياناتي</h2>
          <label className="block space-y-2"><span>اسمك</span><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-input bg-glass px-4 py-3 outline-none focus:border-primary" /></label>
          <fieldset><legend className="mb-2">المرحلة الدراسية</legend><div className="flex gap-2">{(["ثانوي", "جامعي"] as const).map((value) => <Button key={value} type="button" variant={level === value ? "default" : "outline"} aria-pressed={level === value} onClick={() => { setLevel(value); setMessage(""); }}>{value}</Button>)}</div></fieldset>
        </section>
        <section className="space-y-4 border-t border-glass-border pt-6"><h2 className="text-xl font-bold">اهتماماتي</h2><div className="flex flex-wrap gap-2">{FIELDS.map((field) => <Button key={field} type="button" variant={interests.includes(field) ? "default" : "outline"} aria-pressed={interests.includes(field)} onClick={() => { setInterests((old) => old.includes(field) ? old.filter((f) => f !== field) : [...old, field]); setMessage(""); }}>{interests.includes(field) && <Check />}{field}</Button>)}</div></section>
        <section className="border-t border-glass-border pt-6"><h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><Bell className="text-gold" /> الإشعارات</h2><div className="flex items-center justify-between gap-4"><label htmlFor="notifications-enabled">إشعارات الفرص داخل التطبيق</label><Switch id="notifications-enabled" checked={enabled} onCheckedChange={(value) => { setEnabled(value); setMessage(""); }} /></div>
          <Button asChild variant="link" className="mt-3 px-0"><Link to="/notifications">الإشعارات غير المقروءة ({unreadCount})</Link></Button>
        </section>
        {error && <p role="alert" className="text-destructive">{error}</p>}{message && <p role="status" className="text-success">{message}</p>}
        <Button type="submit" size="lg" className="w-full sm:w-auto"><Save /> حفظ التغييرات</Button>
      </form>
      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-glass-border pt-6">
        {user.role === "organizer" && <Button asChild variant="outline"><Link to="/review"><ShieldCheck /> مراجعة منشوراتي</Link></Button>}
        <Button variant="ghost" className="text-destructive" onClick={() => { localStorage.removeItem(USER_KEY); window.dispatchEvent(new Event("gambi-updated")); navigate({ to: "/login" }); }}><LogOut /> تسجيل الخروج</Button>
      </section>
    </main><Footer /></div>;
}