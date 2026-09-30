import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MdSearchOff } from "react-icons/md";
import FilterChips from "../components/FilterChips.jsx";
import VideoCard, { VideoCardSkeleton } from "../components/VideoCard.jsx";
import { videoApi } from "../api/services.js";

/** Home feed - filter chips + responsive grid. Search/category live in the URL. */
export default function Home() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "All";
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    videoApi.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    videoApi
      .list({ search: search || undefined, category: category !== "All" ? category : undefined })
      .then((v) => !ignore && setVideos(v))
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => { ignore = true; };
  }, [search, category]);

  const changeCategory = (c) => {
    const next = new URLSearchParams(params);
    if (c === "All") next.delete("category");
    else next.set("category", c);
    setParams(next);
  };

  return (
    <div className="home">
      <FilterChips categories={categories} active={category} onChange={changeCategory} />

      {search && (
        <p className="results-note">
          Showing results for <strong>&ldquo;{search}&rdquo;</strong>
          {category !== "All" && <> in <strong>{category}</strong></>}
        </p>
      )}

      {error ? (
        <div className="empty">
          <h2>Couldn&apos;t load videos</h2>
          <p>{error}. Make sure the API server is running.</p>
        </div>
      ) : loading ? (
        <div className="video-grid">
          {Array.from({ length: 12 }, (_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty">
          <MdSearchOff size={64} />
          <h2>No results found</h2>
          <p>Try different keywords or remove search filters.</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
