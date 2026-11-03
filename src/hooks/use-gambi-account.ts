import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getAllItems, getUser, saveUser, type GambiUser } from "@/lib/gambi";
import { buildNotifications, type GambiNotification } from "@/lib/notifications";

export function useGambiAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState<GambiUser | null>(null);
  const [notifications, setNotifications] = useState<GambiNotification[]>([]);
  useEffect(() => {
    const refresh = () => {
      const current = getUser();
      setUser(current);
      setNotifications(current ? buildNotifications(current, getAllItems()) : []);
      if (!current) navigate({ to: "/login" });
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("gambi-updated", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("gambi-updated", refresh);
      window.clearInterval(timer);
    };
  }, [navigate]);
  const markRead = useCallback((ids: string[]) => {
    const current = getUser();
    if (!current) return;
    saveUser({ ...current, readNotificationIds: [...new Set([...(current.readNotificationIds ?? []), ...ids])] });
  }, []);
  return { user, notifications, markRead, unreadCount: notifications.filter((n) => !n.read).length };
}