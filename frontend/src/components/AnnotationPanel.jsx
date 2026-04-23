import { useEffect } from "react";
import { X } from "lucide-react";

const TYPE_LABELS = {
  source:      { label: "Source",      color: "bg-blue-50 text-blue-600 border-blue-200" },
  model:       { label: "Model output","color": "bg-amber-50 text-amber-700 border-amber-200" },
  methodology: { label: "Methodology", color: "bg-purple-50 text-purple-600 border-purple-200" },
};

export default function AnnotationPanel({ annotation, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!annotation) return null;

  const meta = TYPE_LABELS[annotation.type] || TYPE_LABELS.source;

  return (
    <>
      {/* Backdrop — click to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel — desktop: right side. Mobile: bottom sheet */}
      <div className="fixed z-50 bg-white shadow-panel
        right-0 top-0 bottom-0 w-full max-w-[360px]
        md:translate-x-0
        flex flex-col
        transition-transform duration-300 ease-out"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
          <div>
            <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded border mb-2 ${meta.color}`}>
              {meta.label}
            </span>
            <h3 className="text-[15px] font-semibold text-ink-primary leading-snug">
              {annotation.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-ink-tertiary hover:bg-surface hover:text-ink-primary transition-colors flex-shrink-0 mt-1"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <p className="text-[15px] leading-[1.7] text-ink-secondary">
            {annotation.body}
          </p>
        </div>
      </div>
    </>
  );
}
