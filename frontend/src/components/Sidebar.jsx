import { NavLink, Link, useLocation, useSearchParams } from "react-router-dom";
import { MdHomeFilled, MdOutlineSubscriptions, MdOutlineVideoLibrary, MdOutlineAccountBox, MdAddCircleOutline, MdHistory, MdOutlineThumbUp, MdOutlineMusicNote, MdOutlineSportsEsports, MdOutlineMovie, MdOutlineSchool, MdCode, MdOutlineFlight, MdOutlineScience, MdOutlineEmojiEmotions, MdOutlineSportsSoccer, MdOutlineNewspaper, MdOutlineSettings, MdOutlineFlag, MdHelpOutline } from "react-icons/md";
import { SiYoutubeshorts } from "react-icons/si";
import { FaRegUserCircle } from "react-icons/fa";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";

const EXPLORE = [
  ["Coding", MdCode],
  ["Education", MdOutlineSchool],
  ["Music", MdOutlineMusicNote],
  ["Gaming", MdOutlineSportsEsports],
  ["Movies", MdOutlineMovie],
  ["Travel", MdOutlineFlight],
  ["Science", MdOutlineScience],
  ["Comedy", MdOutlineEmojiEmotions],
  ["Sports", MdOutlineSportsSoccer],
  ["News", MdOutlineNewspaper],
];

/**
 * Sidebar with two presentations:
 *  - "docked": sits beside the content; toggles between full (240px) and mini (72px)
 *  - "mini": always the 72px rail (tablet widths)
 *  - "overlay": slides in over the content as a drawer (small screens + watch page)
 */
export default function Sidebar({ variant }) {
  const { sidebarOpen, setSidebarOpen, notify } = useUI();
  const { user, channel } = useAuth();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const activeCategory = pathname === "/" ? params.get("category") : null;
  const closeIfOverlay = () => variant === "overlay" && setSidebarOpen(false);
  const soon = (label) => () => notify(`${label} is not part of this clone yet`);

  // Mini rail (docked + collapsed)
  if (variant === "mini" || (variant === "docked" && !sidebarOpen)) {
    return (
      <nav className="mini-sidebar" aria-label="Main">
        <NavLink to="/" end className="mini-item"><MdHomeFilled size={24} /><span>Home</span></NavLink>
        <button className="mini-item" onClick={soon("Shorts")}><SiYoutubeshorts size={22} /><span>Shorts</span></button>
        <button className="mini-item" onClick={soon("Subscriptions")}><MdOutlineSubscriptions size={24} /><span>Subscriptions</span></button>
        <NavLink to={channel ? `/channel/${channel._id}` : user ? "/channel/new" : "/login"} className="mini-item">
          <MdOutlineVideoLibrary size={24} /><span>You</span>
        </NavLink>
      </nav>
    );
  }

  const link = ({ isActive }) => `side-item ${isActive ? "side-item--active" : ""}`;

  const body = (
    <nav className={`sidebar ${variant === "overlay" ? "sidebar--overlay" : ""}`} aria-label="Main">
      {variant === "overlay" && (
        <div className="sidebar__head">
          <button className="icon-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3V5h18v1zm0 5H3v1h18v-1zm0 6H3v1h18v-1z" /></svg>
          </button>
          <Logo onClick={closeIfOverlay} />
        </div>
      )}
      <div className="sidebar__scroll">
        <section className="side-section">
          <NavLink to="/" end className={() => `side-item ${pathname === "/" && !activeCategory ? "side-item--active" : ""}`} onClick={closeIfOverlay}>
            <MdHomeFilled size={24} /> Home
          </NavLink>
          <button className="side-item" onClick={soon("Shorts")}><SiYoutubeshorts size={22} /> Shorts</button>
          <button className="side-item" onClick={soon("Subscriptions")}><MdOutlineSubscriptions size={24} /> Subscriptions</button>
        </section>

        <section className="side-section">
          <h3 className="side-title">You &rsaquo;</h3>
          {channel ? (
            <NavLink to={`/channel/${channel._id}`} className={link} onClick={closeIfOverlay}>
              <MdOutlineAccountBox size={24} /> Your channel
            </NavLink>
          ) : (
            <NavLink to={user ? "/channel/new" : "/login"} className={link} onClick={closeIfOverlay}>
              <MdAddCircleOutline size={24} /> Create channel
            </NavLink>
          )}
          <button className="side-item" onClick={soon("History")}><MdHistory size={24} /> History</button>
          <button className="side-item" onClick={soon("Liked videos")}><MdOutlineThumbUp size={24} /> Liked videos</button>
        </section>

        {!user && (
          <section className="side-section side-signin">
            <p>Sign in to like videos, comment, and subscribe.</p>
            <Link to="/login" className="signin-btn" onClick={closeIfOverlay}>
              <FaRegUserCircle size={20} /> <span>Sign in</span>
            </Link>
          </section>
        )}

        <section className="side-section">
          <h3 className="side-title">Explore</h3>
          {EXPLORE.map(([name, Icon]) => (
            <Link
              key={name}
              to={`/?category=${encodeURIComponent(name)}`}
              className={`side-item ${activeCategory === name ? "side-item--active" : ""}`}
              onClick={closeIfOverlay}
            >
              <Icon size={24} /> {name}
            </Link>
          ))}
        </section>

        <section className="side-section">
          <button className="side-item" onClick={soon("Settings")}><MdOutlineSettings size={24} /> Settings</button>
          <button className="side-item" onClick={soon("Report history")}><MdOutlineFlag size={24} /> Report history</button>
          <button className="side-item" onClick={soon("Help")}><MdHelpOutline size={24} /> Help</button>
        </section>

        <footer className="side-footer">
          <p>About Press Copyright Contact us Creators Advertise Developers</p>
          <p>Terms Privacy Policy &amp; Safety How YouTube works</p>
          <p className="side-footer__copy">Built with the MERN stack for learning purposes.</p>
        </footer>
      </div>
    </nav>
  );

  if (variant === "overlay") {
    return (
      <>
        <div className={`backdrop ${sidebarOpen ? "backdrop--show" : ""}`} onClick={() => setSidebarOpen(false)} />
        <div className={`drawer ${sidebarOpen ? "drawer--open" : ""}`}>{body}</div>
      </>
    );
  }
  return body;
}
