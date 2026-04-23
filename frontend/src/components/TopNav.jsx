import { Link } from "react-router-dom";
import useScrollNav from "../hooks/useScrollNav";

export default function TopNav() {
  const visible = useScrollNav(80);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center px-8 transition-all duration-300"
      style={{
        background: visible ? "rgba(255,255,255,0.88)" : "transparent",
        backdropFilter: visible ? "blur(12px)" : "none",
        borderBottom: visible ? "1px solid rgba(0,0,0,0.05)" : "none",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <Link
        to="/"
        className="text-[17px] font-semibold text-ink-primary tracking-tight mr-auto"
      >
        July
      </Link>

      <Link
        to="/methodology"
        className="text-sm text-ink-tertiary hover:text-ink-primary transition-colors"
      >
        Methodology
      </Link>
    </nav>
  );
}
