import { useEffect, useState } from "react";

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
     * The class is added for two frames so colour transitions do not run
     * across the swap (see .theme-switching in styles.css).
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
      className="inline-flex min-h-11 items-center px-2 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-foreground sm:min-h-0 sm:py-2"
    >
      {ready && theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

/*
 * Runs before first paint (inlined in the document head) so a stored dark
 * choice never flashes light.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
