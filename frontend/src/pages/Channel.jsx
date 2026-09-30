import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { MdOutlineFileUpload, MdOutlineVideoLibrary, MdChevronRight } from "react-icons/md";
import Avatar from "../components/Avatar.jsx";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard.jsx";
import VideoFormModal from "../components/VideoFormModal.jsx";
import ChannelFormModal from "../components/ChannelFormModal.jsx";
import { ConfirmModal } from "../components/Modal.jsx";
import { channelApi, videoApi } from "../api/services.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { formatCount, formatDate } from "../utils/format.js";

const SORTS = { latest: "Latest", popular: "Popular", oldest: "Oldest" };

/** Channel page: banner, info, subscribe, and full video CRUD for the owner. */
export default function Channel() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { notify } = useUI();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("videos");
  const [sort, setSort] = useState("latest");
  const [editing, setEditing] = useState(null); // video being edited, or "new"
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    Promise.all([channelApi.get(id), channelApi.videos(id)])
      .then(([c, v]) => {
        if (ignore) return;
        setChannel(c);
        setVideos(v);
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [id, user?._id]);

  const isOwner = !!user && channel?.owner?._id === user._id;

  // "Create" button in the header links here with ?upload=1
  useEffect(() => {
    if (isOwner && params.get("upload")) {
      setEditing("new");
      params.delete("upload");
      setParams(params, { replace: true });
    }
  }, [isOwner, params, setParams]);

  const onSaved = (saved, wasEdit) => {
    setVideos((list) => (wasEdit ? list.map((v) => (v._id === saved._id ? { ...v, ...saved } : v)) : [saved, ...list]));
    setChannel((c) => ({ ...c, videoCount: c.videoCount + (wasEdit ? 0 : 1) }));
    setEditing(null);
    notify(wasEdit ? "Video updated" : "Video published - it's now on the home page", "success");
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await videoApi.remove(deleting._id);
      setVideos((list) => list.filter((v) => v._id !== deleting._id));
      setChannel((c) => ({ ...c, videoCount: c.videoCount - 1 }));
      notify("Video deleted");
      setDeleting(null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async () => {
    if (!user) return notify("Sign in to subscribe");
    try {
      const res = await channelApi.subscribe(channel._id);
      setChannel((c) => ({ ...c, isSubscribed: res.isSubscribed, subscribers: res.subscribers }));
    } catch (err) {
      notify(err.message, "error");
    }
    return undefined;
  };

  if (loading) return <div className="page-loader"><span className="spinner" /></div>;
  if (error || !channel) {
    return (
      <div className="empty">
        <h2>This channel doesn&apos;t exist</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn--primary">Back to Home</Link>
      </div>
    );
  }

  const sorted = [...videos].sort((a, b) => {
    if (sort === "popular") return b.views - a.views;
    const diff = new Date(b.uploadDate) - new Date(a.uploadDate);
    return sort === "oldest" ? -diff : diff;
  });

  return (
    <div className="channel">
      <div className="channel__inner">
        {channel.channelBanner ? (
          <div className="channel__banner" style={{ backgroundImage: `url(${channel.channelBanner})` }} role="img" aria-label="Channel banner" />
        ) : (
          <div className="channel__banner channel__banner--empty" />
        )}

        <div className="channel__header">
          <Avatar src={channel.channelAvatar} name={channel.channelName} size={160} className="channel__avatar" />
          <div className="channel__details">
            <h1>{channel.channelName}</h1>
            <p className="channel__meta">
              <strong>@{channel.handle}</strong>
              <span className="dot">&bull;</span>
              {formatCount(channel.subscribers)} subscribers
              <span className="dot">&bull;</span>
              {channel.videoCount} video{channel.videoCount === 1 ? "" : "s"}
            </p>
            <button className="channel__desc" onClick={() => setAboutOpen((o) => !o)}>
              <span className={aboutOpen ? "" : "clamp-1"}>{channel.description || "More about this channel"}</span>
              <MdChevronRight size={20} />
            </button>
            <div className="channel__buttons">
              {isOwner ? (
                <>
                  <button className="btn btn--secondary" onClick={() => setCustomize(true)}>Customize channel</button>
                  <button className="btn btn--dark" onClick={() => setEditing("new")}>
                    <MdOutlineFileUpload size={20} /> Upload video
                  </button>
                </>
              ) : (
                <button className={`btn ${channel.isSubscribed ? "btn--secondary" : "btn--dark"}`} onClick={subscribe}>
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {["videos", "about"].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? "tab--active" : ""}`} onClick={() => setTab(t)}>
              {t === "videos" ? "Videos" : "About"}
            </button>
          ))}
        </div>

        {tab === "videos" ? (
          <>
            {videos.length > 0 && (
              <div className="sort-chips">
                {Object.entries(SORTS).map(([k, label]) => (
                  <button key={k} className={`chip ${sort === k ? "chip--active" : ""}`} onClick={() => setSort(k)}>{label}</button>
                ))}
              </div>
            )}
            {videos.length === 0 ? (
              <div className="empty empty--compact">
                <MdOutlineVideoLibrary size={72} />
                <h2>{isOwner ? "Create content on any device" : "This channel has no videos yet"}</h2>
                {isOwner && (
                  <>
                    <p>Upload and record at home or on the go. Everything you make public will appear here.</p>
                    <button className="btn btn--dark" onClick={() => setEditing("new")}>Upload video</button>
                  </>
                )}
              </div>
            ) : (
              <div className="video-grid video-grid--channel">
                {loading
                  ? Array.from({ length: 8 }, (_, i) => <VideoCardSkeleton key={i} />)
                  : sorted.map((v) => (
                      <VideoCard
                        key={v._id}
                        video={v}
                        showChannel={false}
                        onEdit={isOwner ? (vid) => setEditing(vid) : undefined}
                        onDelete={isOwner ? (vid) => setDeleting(vid) : undefined}
                      />
                    ))}
              </div>
            )}
          </>
        ) : (
          <div className="about">
            <h2>Description</h2>
            <p className="about__text">{channel.description || "No description yet."}</p>
            <h2>Stats</h2>
            <ul className="about__stats">
              <li>Joined {formatDate(channel.createdAt)}</li>
              <li>{channel.subscribers.toLocaleString()} subscribers</li>
              <li>{videos.reduce((s, v) => s + v.views, 0).toLocaleString()} total views</li>
              <li>Owner: {channel.owner?.username}</li>
            </ul>
          </div>
        )}
      </div>

      {editing && (
        <VideoFormModal video={editing === "new" ? null : editing} channelId={channel._id} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete video?"
          message={`"${deleting.title}" and all of its comments will be permanently deleted. This can't be undone.`}
          confirmLabel="Delete forever"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
          busy={busy}
        />
      )}
      {customize && (
        <ChannelFormModal
          channel={channel}
          onClose={() => setCustomize(false)}
          onSaved={(c) => {
            setChannel((prev) => ({ ...prev, ...c, owner: prev.owner }));
            setCustomize(false);
            refreshUser();
            notify("Channel updated", "success");
          }}
        />
      )}
    </div>
  );
}
