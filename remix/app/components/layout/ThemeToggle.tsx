import { Moon, Sun } from "lucide-react";

import { Button } from "~/components/ui/button";

/**
 * Light/dark switch.
 *
 * The current theme lives in the `dark` class on <html> (set before paint by the
 * inline script in root.tsx), never in React state, so the button renders
 * identically on the server and during hydration. Which icon is visible is
 * decided purely by CSS.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works.
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  );
}
