import { MapPin } from "lucide-react";

export function Backdrop() {
  return (
    <div className="aurora-bg" aria-hidden>
      <div className="blob b1" />
      <div className="blob b2" />
    </div>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`relative grid place-items-center rounded-xl bg-neon shadow-glow-strong ${size === "lg" ? "h-11 w-11" : "h-9 w-9"}`}>
        <MapPin className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <span className={`font-display font-extrabold tracking-tight ${size === "lg" ? "text-3xl" : "text-2xl"}`}>
        جنبي
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-muted-foreground">
      صُنع بحب في أسوان © <span className="font-mono">2026</span> - جنبي
    </footer>
  );
}
