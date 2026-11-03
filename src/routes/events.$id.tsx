import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight, BadgeCheck, CalendarClock, Clock3, ListChecks, MapPin, Navigation, Ruler,
  Sparkles, TicketCheck, User,
} from "lucide-react";
import { Backdrop, Footer, Logo } from "@/components/Backdrop";
import { EVENT_DETAILS } from "@/data/events";
import {
  ASWAN_CENTER, formatDistance, getAllItems, getRelativeTime, getUser, haversine, isSoon,
  type GambiItem,
} from "@/lib/gambi";

export const Route = createFileRoute("/events/$id")({
  head: ({ params }) => {
    const item = getAllItems().find((i) => String(i.id) === params.id);
    return {
      meta: [
        { title: item ? `جنبي | ${item.title}` : "جنبي | تفاصيل الفرصة" },
        { name: "description", content: item?.description ?? "تفاصيل الفرصة في أسوان" },
        { property: "og:title", content: item?.title ?? "جنبي" },
        { property: "og:description", content: item?.description ?? "" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }): GambiItem => {
    const item = getAllItems().find((i) => String(i.id) === params.id);
    if (!item) throw notFound();
    return item;
  },
  component: EventDetails,
  notFoundComponent: () => (
    <div dir="rtl" className="grid min-h-screen place-items-center">
      <Backdrop />
      <div className="glass p-10 text-center">
        <p className="font-display text-xl font-bold">الفرصة دي مش موجودة</p>
        <Link to="/" className="press mt-4 inline-block rounded-xl bg-neon px-6 py-3 font-bold text-primary-foreground shadow-glow">
          ارجع للخريطة
        </Link>
      </div>
    </div>
  ),
});

function EventDetails() {
  const item = Route.useLoaderData() as GambiItem;
  const nav = useNavigate();
  const user = getUser();
  const me = ASWAN_CENTER;
  const distance = haversine(me.lat, me.lng, item.lat, item.lng);
  const details = EVENT_DETAILS[item.id];
  const soon = isSoon(item.time);
  const isEvent = item.type === "event";

  return (
    <div dir="rtl" className="min-h-screen">
      <Backdrop />
      <header className="sticky top-0 z-[1000] border-b border-glass-border bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <button onClick={() => nav({ to: "/" })} className="press flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-bold">
            <ArrowRight className="h-4 w-4" /> ارجع للخريطة
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="glass animate-fade-up p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isEvent ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>
              {item.field}
            </span>
            {item.time && (
              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${soon ? "bg-live/15 text-live" : "bg-secondary text-muted-foreground"}`}>
                {soon && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-live" />}
                {getRelativeTime(item.time).replace(" 🔴", "")}
              </span>
            )}
            {item.hours && <span className="rounded-full border border-success/30 px-3 py-1 text-xs text-success">{item.hours}</span>}
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-snug md:text-4xl">{item.title}</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{item.description}</p>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {item.placeName}</span>
            <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4 text-primary" /> <span className="font-mono text-foreground">{formatDistance(distance)}</span> من الكورنيش</span>
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" /> {item.organizer}
              {item.isVerified && <><BadgeCheck className="h-4 w-4 text-success" /><span className="text-xs text-success">موثق</span></>}
            </span>
          </div>
        </section>

        {isEvent && item.time && (
          <section className="glass animate-fade-up p-6 md:p-8" style={{ animationDelay: "60ms" }}>
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-primary">
              <CalendarClock className="h-5 w-5" /> التوقيت
            </h2>
            <p className="mt-3 text-lg">
              {new Date(item.time).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
              {" — "}
              {new Date(item.time).toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{getRelativeTime(item.time)}</p>
          </section>
        )}

        {details?.schedule && (
          <section className="glass animate-fade-up p-6 md:p-8" style={{ animationDelay: "120ms" }}>
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-primary">
              <Clock3 className="h-5 w-5" /> برنامج اليوم
            </h2>
            <ol className="mt-4 space-y-3">
              {details.schedule.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">{i + 1}</span>
                  <span className="pt-0.5 leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {details?.requirements && (
          <section className="glass animate-fade-up p-6 md:p-8" style={{ animationDelay: "180ms" }}>
            <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-gold">
              <ListChecks className="h-5 w-5" /> مطلوب منك
            </h2>
            <ul className="mt-4 space-y-2.5">
              {details.requirements.map((r, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="glass animate-fade-up border-gold/30! p-6 md:p-8" style={{ animationDelay: "240ms" }}>
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-gold">
            <TicketCheck className="h-5 w-5" /> {isEvent ? "طريقة الحجز" : "قبل ما تروح"}
          </h2>
          <p className="mt-3 leading-relaxed">
            {details?.booking ?? (isEvent ? "الحجز عن طريق التواصل مع المنظم مباشرة." : `${item.hours ?? ""} — ${item.audience ?? ""}`)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {isEvent && (
              <a href={`https://www.google.com/search?q=${encodeURIComponent(item.organizer + " " + item.title)}`} target="_blank" rel="noreferrer" className="press flex items-center gap-2 rounded-2xl bg-neon px-6 py-3 font-display font-bold text-primary-foreground shadow-glow">
                <Sparkles className="h-4 w-4" /> احجز مكانك دلوقتي
              </a>
            )}
            <a href={`https://www.openstreetmap.org/directions?to=${item.lat},${item.lng}`} target="_blank" rel="noreferrer" className="press flex items-center gap-2 rounded-2xl glass px-6 py-3 font-bold text-success hover:bg-success/10">
              <Navigation className="h-4 w-4" /> الاتجاهات على الخريطة
            </a>
          </div>
        </section>

        {!user && null}
      </main>
      <Footer />
    </div>
  );
}
