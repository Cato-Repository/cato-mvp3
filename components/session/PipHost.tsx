import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Portals its children into an already-open Document PiP window, or
 * renders them inline when no PiP window is open (unsupported browser, or
 * the user closed the floating window). The window itself must be opened
 * upstream via `openTimerPipWindow()` synchronously inside the "Start
 * Session" click handler — a user gesture can't be captured from here,
 * since this component only mounts after that click already happened.
 * This is the one place that watches for the user closing the PiP window
 * (`pagehide`) and reports it back so the caller can fall back to inline.
 */
export function PipHost({
  pipWindow,
  onPipClosed,
  children,
}: {
  pipWindow: Window | null;
  onPipClosed: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (pipWindow === null) return;
    const handlePageHide = () => onPipClosed();
    pipWindow.addEventListener("pagehide", handlePageHide);
    return () => pipWindow.removeEventListener("pagehide", handlePageHide);
  }, [pipWindow, onPipClosed]);

  if (pipWindow !== null) {
    return createPortal(children, pipWindow.document.body);
  }

  return <div className="flex flex-col items-center">{children}</div>;
}
