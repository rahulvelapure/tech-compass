import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "rv-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTheme(stored === "dark" ? "dark" : "light");
    setReady(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);

    /*
     * Suppress transitions across the swap.
     *
     * The theme rewrites inherited custom properties. An element with a
     * `color` transition then interpolates from its old value and never
     * re-resolves the new one, stranding it on the previous theme's colour —
     * see the .theme-switching rule in styles.css. Two frames is the minimum
     * that reliably covers the class landing and the repaint.
     */
    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", next === "dark");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove("theme-switching"));
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex size-9 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-accent hover:text-foreground"
    >
      {ready && theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/**
 * Applies the stored theme before paint so light/dark does not flash.
 * Kept as a string so it can be injected once, pre-hydration.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
