import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const UIContext = createContext(null);

/** Sidebar state, theme and toast notifications shared across the app. */
export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1312);
  const [theme, setTheme] = useState(() => localStorage.getItem("yt_theme") || "light");
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("yt_theme", theme);
  }, [theme]);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const notify = useCallback((message, type = "info") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, toggleSidebar, theme, toggleTheme, notify }),
    [sidebarOpen, toggleSidebar, theme, toggleTheme, notify]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
