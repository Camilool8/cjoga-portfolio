import { useState, useEffect } from "react";

/**
 * Hook to detect system color scheme preference and listen for changes
 * @returns {string} 'dark' or 'light' based on system preference
 */
function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState(() => {
    // Check if window is defined (for SSR)
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light"; // Default fallback
  });

  useEffect(() => {
    // Create media query to detect preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Update state when preference changes
    const handleChange = (e) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange);

    // Clean up listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return systemTheme;
}

export default useSystemTheme;
