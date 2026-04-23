import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../api";

export default function useBackendWarm() {
  const [warm, setWarm]         = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const intervalRef = useRef(null);
  const elapsedRef  = useRef(0);
  const MAX_WAIT    = 60;

  const check = async () => {
    try {
      const res = await fetch(API_BASE + "/api/health");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.data?.screener && data.data?.backtest) {
        setWarm(true);
        clearInterval(intervalRef.current);
      }
    } catch {
      // still cold — keep polling
    }
  };

  const startPolling = () => {
    clearInterval(intervalRef.current);
    setWarm(false);
    setTimedOut(false);
    setElapsed(0);
    elapsedRef.current = 0;

    check();

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 3;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= MAX_WAIT) {
        setTimedOut(true);
        clearInterval(intervalRef.current);
        return;
      }
      check();
    }, 3000);
  };

  useEffect(() => {
    startPolling();
    return () => clearInterval(intervalRef.current);
  }, []);

  return { warm, timedOut, elapsed, retry: startPolling };
}
