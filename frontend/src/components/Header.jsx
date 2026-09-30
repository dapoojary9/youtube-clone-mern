import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MdMenu, MdSearch, MdArrowBack, MdKeyboardVoice, MdOutlineVideoCall, MdLogout, MdOutlineDarkMode, MdOutlineLightMode, MdOutlineAccountBox, MdAddCircleOutline } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import { IoNotificationsOutline, IoClose } from "react-icons/io5";
import Logo from "./Logo.jsx";
import Avatar from "./Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";

/** Top app bar: hamburger, logo, search (filters by title), create button and account menu. */
export default function Header() {
  const { user, channel, logout } = useAuth();
  const { toggleSidebar, theme, toggleTheme, notify } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") || "");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Keep the input in sync when the URL changes (e.g. back button)
  useEffect(() => setQuery(params.get("search") || ""), [params]);

  // Close account menu on outside click
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    const next = new URLSearchParams();
    if (q) next.set("search", q);
    const category = params.get("category");
    if (category) next.set("category", category);
    navigate({ pathname: "/", search: next.toString() });
    setMobileSearch(false);
  };

  const clearSearch = () => {
    setQuery("");
    if (params.get("search")) navigate("/");
  };

  const handleCreate = () => {
    if (channel) navigate(`/channel/${channel._id}?upload=1`);
    else navigate("/channel/new");
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    notify("You have been signed out");
    navigate("/");
  };

  return (
    <header className={`header ${mobileSearch ? "header--searching" : ""}`}>
      <div className="header__start">
        <button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <MdMenu size={24} />
        </button>
        <Logo />
      </div>

      <form className="header__center" onSubmit={submitSearch} role="search">
        {mobileSearch && (
          <button type="button" className="icon-btn header__back" onClick={() => setMobileSearch(false)} aria-label="Close search">
            <MdArrowBack size={24} />
          </button>
        )}
        <div className="search">
          <MdSearch className="search__lead" size={20} />
          <input
            className="search__input"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search videos by title"
          />
          {query && (
            <button type="button" className="search__clear" onClick={clearSearch} aria-label="Clear search">
              <IoClose size={22} />
            </button>
          )}
          <button type="submit" className="search__btn" aria-label="Search">
            <MdSearch size={24} />
          </button>
        </div>
        <button type="button" className="icon-btn icon-btn--filled header__mic" aria-label="Search with your voice" onClick={() => notify("Voice search isn't available in this clone")}>
          <MdKeyboardVoice size={22} />
        </button>
      </form>

      <div className="header__end">
        <button className="icon-btn header__search-toggle" onClick={() => setMobileSearch(true)} aria-label="Search">
          <MdSearch size={24} />
        </button>

        {user ? (
          <>
            <button className="create-btn" onClick={handleCreate} aria-label="Create">
              <MdOutlineVideoCall size={24} />
              <span>Create</span>
            </button>
            <button className="icon-btn header__bell" aria-label="Notifications" onClick={() => notify("No new notifications")}>
              <IoNotificationsOutline size={24} />
            </button>
            <div className="account" ref={menuRef}>
              <button className="account__trigger" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <Avatar src={user.avatar} name={user.username} size={32} />
                <span className="account__name">{user.username}</span>
              </button>
              {menuOpen && (
                <div className="menu" role="menu">
                  <div className="menu__profile">
                    <Avatar src={user.avatar} name={user.username} size={40} />
                    <div>
                      <div className="menu__title">{user.username}</div>
                      <div className="menu__sub">{user.email}</div>
                      {channel ? (
                        <Link to={`/channel/${channel._id}`} className="menu__link" onClick={() => setMenuOpen(false)}>View your channel</Link>
                      ) : (
                        <Link to="/channel/new" className="menu__link" onClick={() => setMenuOpen(false)}>Create a channel</Link>
                      )}
                    </div>
                  </div>
                  <hr />
                  {channel ? (
                    <button className="menu__item" onClick={() => { setMenuOpen(false); navigate(`/channel/${channel._id}`); }}>
                      <MdOutlineAccountBox size={22} /> Your channel
                    </button>
                  ) : (
                    <button className="menu__item" onClick={() => { setMenuOpen(false); navigate("/channel/new"); }}>
                      <MdAddCircleOutline size={22} /> Create channel
                    </button>
                  )}
                  <button className="menu__item" onClick={toggleTheme}>
                    {theme === "dark" ? <MdOutlineLightMode size={22} /> : <MdOutlineDarkMode size={22} />}
                    Appearance: {theme === "dark" ? "Dark" : "Light"}
                  </button>
                  <button className="menu__item" onClick={handleLogout}>
                    <MdLogout size={22} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
              {theme === "dark" ? <MdOutlineLightMode size={22} /> : <MdOutlineDarkMode size={22} />}
            </button>
            <Link to="/login" className="signin-btn">
              <FaRegUserCircle size={20} />
              <span>Sign in</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
