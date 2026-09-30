import { getYouTubeId } from "../utils/format.js";

/**
 * Plays YouTube links through the official embed player and
 * direct media files (mp4/webm) through the native HTML5 <video> element.
 */
export default function VideoPlayer({ url, poster, title }) {
  const ytId = getYouTubeId(url);
  return (
    <div className="player">
      {ytId ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video src={url} poster={poster} controls autoPlay playsInline>
          <track kind="captions" />
          Your browser does not support HTML5 video.
        </video>
      )}
    </div>
  );
}
