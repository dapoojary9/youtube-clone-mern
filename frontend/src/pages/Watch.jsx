import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { PiShareFat } from "react-icons/pi";
import { MdCheckCircle, MdOutlineFileDownload } from "react-icons/md";
import VideoPlayer from "../components/VideoPlayer.jsx";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard.jsx";
import CommentSection from "../components/CommentSection.jsx";
import Avatar from "../components/Avatar.jsx";
import { channelApi, videoApi } from "../api/services.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { formatCount, formatDate, timeAgo } from "../utils/format.js";

/** Video player page: player, details, like/dislike, subscribe, comments, related videos. */
export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [reacting, setReacting] = useState(false);
  const viewed = useRef(null);

  // Load the video (re-fetch when the user logs in/out to get their reaction)
  useEffect(() => {
    let ignore = false;
    setError("");
    setExpanded(false);
    videoApi
      .get(id)
      .then((v) => !ignore && setVideo(v))
      .catch((err) => !ignore && setError(err.message));
    return () => { ignore = true; };
  }, [id, user?._id]);

  // Count one view per page visit (guard prevents StrictMode double counting)
  useEffect(() => {
    if (viewed.current === id) return;
    viewed.current = id;
    videoApi.addView(id).then((views) => setVideo((v) => (v && v._id === id ? { ...v, views } : v))).catch(() => {});
  }, [id]);

  // Related videos: same category first, then everything else
  useEffect(() => {
    if (!video?._id) return;
    Promise.all([
      videoApi.list({ category: video.category, exclude: video._id, limit: 12 }),
      videoApi.list({ exclude: video._id, limit: 20 }),
    ])
      .then(([same, all]) => {
        const seen = new Set(same.map((v) => v._id));
        setRelated([...same, ...all.filter((v) => !seen.has(v._id))].slice(0, 20));
      })
      .catch(() => {});
  }, [video?._id, video?.category]);

  const requireAuth = (message) => {
    if (user) return true;
    notify(message);
    navigate("/login", { state: { from: `/watch/${id}` } });
    return false;
  };

  const react = async (type) => {
    if (!requireAuth(`Sign in to ${type} this video`) || reacting) return;
    setReacting(true);
    try {
      const res = type === "like" ? await videoApi.like(id) : await videoApi.dislike(id);
      setVideo((v) => ({ ...v, likes: res.likes, dislikes: res.dislikes, userReaction: res.userReaction }));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setReacting(false);
    }
  };

  const subscribe = async () => {
    if (!requireAuth("Sign in to subscribe to this channel")) return;
    try {
      const res = await channelApi.subscribe(video.channel._id);
      setVideo((v) => ({ ...v, isSubscribed: res.isSubscribed, channel: { ...v.channel, subscribers: res.subscribers } }));
      notify(res.isSubscribed ? "Subscription added" : "Subscription removed");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Link copied to clipboard");
    } catch {
      notify(window.location.href);
    }
  };

  if (error) {
    return (
      <div className="empty">
        <h2>Video unavailable</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn--primary">Back to Home</Link>
      </div>
    );
  }

  if (!video) return <div className="page-loader"><span className="spinner" /></div>;

  const channel = video.channel || {};
  const isOwner = user && channel.owner === user._id;

  return (
    <div className="watch">
      <div className="watch__primary">
        <VideoPlayer url={video.videoUrl} poster={video.thumbnailUrl} title={video.title} />

        <h1 className="watch__title">{video.title}</h1>

        <div className="watch__bar">
          <div className="watch__channel">
            <Link to={`/channel/${channel._id}`}>
              <Avatar src={channel.channelAvatar} name={channel.channelName} size={40} />
            </Link>
            <div className="watch__channel-info">
              <Link to={`/channel/${channel._id}`} className="watch__channel-name">
                {channel.channelName} <MdCheckCircle size={14} className="verified" />
              </Link>
              <span className="muted small">{formatCount(channel.subscribers)} subscribers</span>
            </div>
            {isOwner ? (
              <Link to={`/channel/${channel._id}`} className="btn btn--secondary">Manage videos</Link>
            ) : (
              <button className={`btn ${video.isSubscribed ? "btn--secondary" : "btn--dark"}`} onClick={subscribe}>
                {video.isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          <div className="watch__actions">
            <div className="pill-group">
              <button className={`pill ${video.userReaction === "like" ? "pill--on" : ""}`} onClick={() => react("like")} aria-pressed={video.userReaction === "like"} aria-label="Like this video" disabled={reacting}>
                {video.userReaction === "like" ? <BiSolidLike size={22} /> : <BiLike size={22} />}
                <span>{formatCount(video.likes)}</span>
              </button>
              <span className="pill-divider" />
              <button className={`pill ${video.userReaction === "dislike" ? "pill--on" : ""}`} onClick={() => react("dislike")} aria-pressed={video.userReaction === "dislike"} aria-label="Dislike this video" disabled={reacting}>
                {video.userReaction === "dislike" ? <BiSolidDislike size={22} /> : <BiDislike size={22} />}
                <span>{formatCount(video.dislikes)}</span>
              </button>
            </div>
            <button className="pill pill--single" onClick={share}><PiShareFat size={22} /> <span>Share</span></button>
            <button className="pill pill--single hide-sm" onClick={() => notify("Downloads are not available in this clone")}>
              <MdOutlineFileDownload size={22} /> <span>Download</span>
            </button>
          </div>
        </div>

        <div className={`desc ${expanded ? "desc--open" : ""}`} onClick={() => !expanded && setExpanded(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}>
          <div className="desc__stats">
            {video.views.toLocaleString()} view{video.views === 1 ? "" : "s"} <span>{expanded ? formatDate(video.uploadDate) : timeAgo(video.uploadDate)}</span>
            <span className="desc__tag">#{video.category}</span>
          </div>
          <p className="desc__text">{video.description || "No description has been added to this video."}</p>
          <button className="desc__toggle" onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}>
            {expanded ? "Show less" : "...more"}
          </button>
        </div>

        <CommentSection videoId={video._id} />
      </div>

      <aside className="watch__secondary" aria-label="Related videos">
        {related.length === 0
          ? Array.from({ length: 6 }, (_, i) => <VideoCardSkeleton key={i} layout="row" />)
          : related.map((v) => <VideoCard key={v._id} video={v} layout="row" />)}
      </aside>
    </div>
  );
}
