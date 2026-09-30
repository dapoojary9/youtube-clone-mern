import { Link, useNavigate } from "react-router-dom";
import { MdEdit, MdDeleteOutline, MdCheckCircle } from "react-icons/md";
import Avatar from "./Avatar.jsx";
import { formatViews, timeAgo } from "../utils/format.js";

/**
 * Video thumbnail card.
 * layout="grid" (home/channel) or "row" (related list on the watch page).
 * Pass onEdit/onDelete to show owner controls (channel page).
 */
export default function VideoCard({ video, layout = "grid", showChannel = true, onEdit, onDelete }) {
  const navigate = useNavigate();
  const channel = video.channel || {};
  const url = `/watch/${video._id}`;

  return (
    <article className={`vcard vcard--${layout}`}>
      <Link to={url} className="vcard__thumb">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" onError={(e) => { e.currentTarget.src = "https://placehold.co/640x360/222/fff?text=No+thumbnail"; }} />
        <span className="vcard__badge">{video.category}</span>
      </Link>
      <div className="vcard__meta">
        {showChannel && layout === "grid" && (
          <button className="vcard__avatar" onClick={() => navigate(`/channel/${channel._id}`)} aria-label={channel.channelName}>
            <Avatar src={channel.channelAvatar} name={channel.channelName} size={36} />
          </button>
        )}
        <div className="vcard__info">
          <Link to={url} className="vcard__title" title={video.title}>{video.title}</Link>
          {showChannel && (
            <Link to={`/channel/${channel._id}`} className="vcard__channel">
              {channel.channelName}
              <MdCheckCircle size={13} className="verified" />
            </Link>
          )}
          <div className="vcard__stats">
            {formatViews(video.views)} <span className="dot">&bull;</span> {timeAgo(video.uploadDate)}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="vcard__actions">
            {onEdit && (
              <button className="icon-btn icon-btn--sm" onClick={() => onEdit(video)} aria-label="Edit video" title="Edit">
                <MdEdit size={18} />
              </button>
            )}
            {onDelete && (
              <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => onDelete(video)} aria-label="Delete video" title="Delete">
                <MdDeleteOutline size={20} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Grey shimmer placeholders while videos load. */
export function VideoCardSkeleton({ layout = "grid" }) {
  return (
    <div className={`vcard vcard--${layout} skeleton`}>
      <div className="vcard__thumb sk-block" />
      <div className="vcard__meta">
        {layout === "grid" && <div className="sk-circle" />}
        <div className="vcard__info">
          <div className="sk-line" />
          <div className="sk-line sk-line--short" />
        </div>
      </div>
    </div>
  );
}
