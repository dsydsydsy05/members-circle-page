import { useEffect, useState, useCallback } from "react";

const KEY = "the_room_is_member";

export function useMember() {
  const [isMember, setIsMember] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setIsMember(localStorage.getItem(KEY) === "1");
    } catch {}
    setHydrated(true);
  }, []);

  const join = useCallback(() => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setIsMember(true);
  }, []);
  const leave = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch {}
    setIsMember(false);
  }, []);

  return { isMember, join, leave, hydrated };
}
