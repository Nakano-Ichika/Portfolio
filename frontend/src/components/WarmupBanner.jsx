import { useBackend } from "../context/BackendContext";
import { Loader2 } from "lucide-react";

export default function WarmupBanner() {
  const { warm, timedOut, elapsed, retry } = useBackend();
  if (warm) return null;

  const progress = Math.min((elapsed / 60) * 100, 100);

  return (
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="animate-spin text-amber-500" />
          <span className="font-medium">
            {timedOut
              ? "Server took too long to respond."
              : `Server waking up… (${elapsed}s)`}
          </span>
        </div>
        {timedOut && (
          <button
            onClick={retry}
            className="text-xs font-semibold underline text-amber-700 hover:text-amber-900"
          >
            Try again
          </button>
        )}
      </div>

      {!timedOut && (
        <>
          <div className="h-1 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-amber-600 mt-1.5">
            Render free tier spins down after inactivity — numbers will appear automatically.
          </p>
        </>
      )}
    </div>
  );
}
