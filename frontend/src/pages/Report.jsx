import { useParams, Navigate } from "react-router-dom";
import { getCaseBySlug, CASES } from "../data/cases";
import Landing from "./Landing";

export default function Report() {
  const { slug } = useParams();

  // If slug matches the first (featured) case, render Landing
  if (CASES[0]?.slug === slug) {
    return <Landing />;
  }

  // For future cases: redirect to landing if not found yet
  const c = getCaseBySlug(slug);
  if (!c) return <Navigate to="/research" replace />;

  // Future: render a generic report renderer here
  return <Navigate to="/research" replace />;
}
