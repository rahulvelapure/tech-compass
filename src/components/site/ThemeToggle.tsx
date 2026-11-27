import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "rv-theme";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
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

    const root = document.documentElement;
    root.classList.add("theme-switching");
    root.classList.toggle("dark", next === "dark");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.remove("theme-switching"));
    });
  }

  const isDark = ready && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={
        showLabel
          ? "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground"
          : "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground sm:min-h-9 sm:min-w-9"
      }
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
      {showLabel && <span>{isDark ? "Light appearance" : "Dark appearance"}</span>}
    </button>
  );
}

/*
 * Inlined in <head> before first paint so a stored dark preference never flashes.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
