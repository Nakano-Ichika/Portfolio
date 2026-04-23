import { createContext, useContext } from "react";
import useBackendWarm from "../hooks/useBackendWarm";

export const BackendContext = createContext({
  warm: true,
  timedOut: false,
  elapsed: 0,
  retry: () => {},
});

export function BackendProvider({ children }) {
  const state = useBackendWarm();
  return <BackendContext.Provider value={state}>{children}</BackendContext.Provider>;
}

export const useBackend = () => useContext(BackendContext);
