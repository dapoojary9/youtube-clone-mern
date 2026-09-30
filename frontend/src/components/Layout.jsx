import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { useUI } from "../context/UIContext.jsx";
import useWindowWidth from "../hooks/useWindowWidth.js";

/** App shell: fixed header + responsive sidebar + routed page content. */
export default function Layout() {
  const { pathname } = useLocation();
  const { sidebarOpen, setSidebarOpen } = useUI();
  const width = useWindowWidth();
  const isWatch = pathname.startsWith("/watch");
  // Watch page and narrow screens use a slide-in drawer, like YouTube
  const variant = isWatch || width < 1312 ? "overlay" : "docked";
  const showMini = variant === "docked" || (width >= 792 && !isWatch);

  // Close the drawer whenever the route changes in overlay mode
  useEffect(() => {
    if (variant === "overlay") setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  let offset = "none";
  if (variant === "docked") offset = sidebarOpen ? "full" : "mini";
  else if (showMini) offset = "mini";

  return (
    <div className="app">
      <Header />
      {variant === "docked" ? (
        <Sidebar variant="docked" />
      ) : (
        <>
          {showMini && <Sidebar variant="mini" />}
          <Sidebar variant="overlay" />
        </>
      )}
      <main className={`main main--${offset}`}>
        <Outlet />
      </main>
    </div>
  );
}
