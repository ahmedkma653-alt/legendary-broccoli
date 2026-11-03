import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, BellOff, ArrowLeft, CheckCheck, CalendarClock, ShieldCheck } from "lucide-react";
import { Backdrop, Footer } from "@/components/Backdrop";
import { AccountHeader } from "@/components/AccountHeader";
import { Button } from "@/components/ui/button";
import { useGambiAccount } from "@/hooks/use-gambi-account";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "إشعارات الفرص | جنبي" },
    { name: "description", content: "تابع الفرص المناسبة لاهتماماتك وحالة منشوراتك على جنبي في أسوان." },
    { property: "og:title", content: "إشعارات الفرص | جنبي" },
    { property: "og:description", content: "آخر إشعارات الفرص والمنشورات على جنبي." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Notifications,
});

function Notifications() {
  const { user, notifications, markRead, unreadCount } = useGambiAccount();
  const [unreadOnly, setUnreadOnly] = useState(false);
  if (!user) return <Backdrop />;
  const shown = notifications.filter((n) => !unreadOnly || !n.read);
  return <div dir="rtl" className="min-h-screen"><Backdrop /><AccountHeader />
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="flex items-center gap-3 text-3xl font-extrabold"><Bell className="text-gold" /> الإشعارات <span className="text-xl text-muted-foreground">({unreadCount})</span></h1>
      <div className="my-6 flex flex-wrap justify-between gap-3"><div className="flex gap-2"><Button variant={!unreadOnly ? "default" : "outline"} aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>الكل</Button><Button variant={unreadOnly ? "default" : "outline"} aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>غير مقروءة</Button></div><Button variant="ghost" disabled={!unreadCount} onClick={() => markRead(notifications.map((n) => n.id))}><CheckCheck /> قراءة الكل</Button></div>
      {shown.length === 0 ? <section className="py-16 text-center"><BellOff className="mx-auto mb-4 h-12 w-12 text-muted-foreground" /><h2 className="text-xl font-bold">{user.notificationsEnabled === false ? "الإشعارات متوقفة" : unreadOnly ? "كل إشعاراتك مقروءة" : "مفيش إشعارات جديدة دلوقتي"}</h2><Button asChild variant="link" className="mt-3"><Link to={user.notificationsEnabled === false ? "/account" : "/"}>{user.notificationsEnabled === false ? "إعدادات الحساب" : "اكتشف الفرص"}<ArrowLeft /></Link></Button></section> :
        <div className="space-y-3">{shown.map((n) => <article key={n.id} className={`glass rounded-lg! p-5 ${!n.read ? "border-primary/30!" : ""}`}>
          <div className="flex gap-3">{n.kind === "event" ? <CalendarClock className="mt-1 shrink-0 text-primary" /> : <ShieldCheck className="mt-1 shrink-0 text-gold" />}<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-bold">{n.title}</h2>{!n.read && <span aria-label="غير مقروء" className="h-2 w-2 shrink-0 rounded-full bg-primary" />}</div><p className="mt-2 break-words text-muted-foreground">{n.body}</p>{n.time && <p className="mt-2 text-sm text-gold">{new Date(n.time).toLocaleString("ar-EG", { timeZone: "Africa/Cairo", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })}</p>}
          <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="outline">{n.kind === "pending" ? <Link to="/review" onClick={() => markRead([n.id])}>راجع المنشور <ArrowLeft /></Link> : <Link to="/events/$id" params={{ id: String(n.itemId) }} onClick={() => markRead([n.id])}>شوف التفاصيل <ArrowLeft /></Link>}</Button>{!n.read && <Button variant="ghost" onClick={() => markRead([n.id])}><CheckCheck /> مقروءة</Button>}</div>
          </div></div>
        </article>)}</div>}
    </main><Footer /></div>;
}