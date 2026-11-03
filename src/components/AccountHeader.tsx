import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, UserRound } from "lucide-react";
import { Logo } from "@/components/Backdrop";
import { Button } from "@/components/ui/button";

export function AccountHeader() {
  return <header className="border-b border-glass-border bg-background/60 backdrop-blur-xl">
    <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
      <Logo />
      <nav className="flex items-center gap-2" aria-label="القائمة">
        <Button asChild variant="ghost" size="icon"><Link to="/notifications" aria-label="الإشعارات" title="الإشعارات"><Bell /></Link></Button>
        <Button asChild variant="ghost" size="icon"><Link to="/account" aria-label="حسابي" title="حسابي"><UserRound /></Link></Button>
        <Button asChild variant="outline"><Link to="/"><ArrowRight /><span className="hidden sm:inline">الرئيسية</span></Link></Button>
      </nav>
    </div>
  </header>;
}