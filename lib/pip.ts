// Minimal shape of the Document Picture-in-Picture API — not yet in
// TypeScript's built-in DOM lib. Chromium-based browsers only as of this
// writing; feature-detected before use, see isPipSupported().
interface DocumentPictureInPictureWindow extends Window {
  document: Document;
}

interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<DocumentPictureInPictureWindow>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export function isPipSupported(): boolean {
  return typeof window !== "undefined" && "documentPictureInPicture" in window;
}

/**
 * Opens the persistent timer's floating window. Must be called
 * synchronously (no prior `await`) inside a user-gesture event handler —
 * transient activation is consumed the moment an async gap occurs before
 * this call. Returns null when unsupported (e.g. Safari) or if the
 * request itself fails; callers should fall back to inline rendering
 * without surfacing an error.
 */
export async function openTimerPipWindow(): Promise<Window | null> {
  if (!isPipSupported()) return null;
  try {
    const pipWindow = await window.documentPictureInPicture!.requestWindow({
      width: 320,
      height: 220,
    });
    copyStylesInto(pipWindow);
    return pipWindow;
  } catch {
    return null;
  }
}

function copyStylesInto(pipWindow: Window) {
  // The PiP window is a separate Document that doesn't inherit the
  // opener's stylesheets, so they're cloned in explicitly. It shares the
  // same JS realm as the opener, so this is a same-origin DOM operation.
  pipWindow.document.documentElement.className = document.documentElement.className;

  for (const sheet of Array.from(document.styleSheets)) {
    const node = sheet.ownerNode;
    if (node instanceof HTMLLinkElement || node instanceof HTMLStyleElement) {
      pipWindow.document.head.appendChild(node.cloneNode(true));
    }
  }
}
