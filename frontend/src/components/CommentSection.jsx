import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdMoreVert, MdEdit, MdDeleteOutline, MdSort } from "react-icons/md";
import Avatar from "./Avatar.jsx";
import { ConfirmModal } from "./Modal.jsx";
import { commentApi } from "../api/services.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { timeAgo } from "../utils/format.js";

/** Full CRUD comment section for a video (flat, no nesting). */
export default function CommentSection({ videoId }) {
  const { user } = useAuth();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [posting, setPosting] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    commentApi
      .list(videoId)
      .then(setComments)
      .catch((err) => notify(err.message, "error"))
      .finally(() => setLoading(false));
  }, [videoId, notify]);

  const requireAuth = () => {
    if (user) return true;
    navigate("/login", { state: { from: `/watch/${videoId}` } });
    return false;
  };

  const add = async (e) => {
    e.preventDefault();
    if (!requireAuth() || !text.trim()) return;
    setPosting(true);
    try {
      const created = await commentApi.add(videoId, text.trim());
      setComments((c) => [created, ...c]);
      setText("");
      setFocused(false);
      notify("Comment added");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setPosting(false);
    }
  };

  const update = async (id, newText) => {
    const updated = await commentApi.update(id, newText);
    setComments((c) => c.map((x) => (x._id === id ? updated : x)));
    notify("Comment updated");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await commentApi.remove(toDelete._id);
      setComments((c) => c.filter((x) => x._id !== toDelete._id));
      notify("Comment deleted");
      setToDelete(null);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="comments" aria-label="Comments">
      <div className="comments__head">
        <h2>{comments.length} Comment{comments.length === 1 ? "" : "s"}</h2>
        <span className="comments__sort"><MdSort size={22} /> Newest first</span>
      </div>

      <form className="comment-form" onSubmit={add}>
        <Avatar src={user?.avatar} name={user?.username || "?"} size={40} />
        <div className="comment-form__body">
          <input
            className="comment-input"
            placeholder={user ? "Add a comment..." : "Sign in to add a comment..."}
            value={text}
            onFocus={() => (user ? setFocused(true) : requireAuth())}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            aria-label="Add a comment"
          />
          {focused && (
            <div className="comment-form__actions">
              <button type="button" className="btn btn--text" onClick={() => { setText(""); setFocused(false); }}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={!text.trim() || posting}>
                {posting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </form>

      {loading ? (
        <div className="page-loader"><span className="spinner" /></div>
      ) : comments.length === 0 ? (
        <p className="muted">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              isOwner={user && c.user?._id === user._id}
              onSave={update}
              onDelete={() => setToDelete(c)}
            />
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmModal
          title="Delete comment"
          message="Delete your comment permanently?"
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
          busy={deleting}
        />
      )}
    </section>
  );
}

function CommentItem({ comment, isOwner, onSave, onDelete }) {
  const { notify } = useUI();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return undefined;
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  const save = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await onSave(comment._id, draft.trim());
      setEditing(false);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const name = comment.user?.username || "Deleted user";

  return (
    <li className="comment">
      <Avatar src={comment.user?.avatar} name={name} size={40} />
      <div className="comment__body">
        {editing ? (
          <form onSubmit={save}>
            <input className="comment-input" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus maxLength={1000} aria-label="Edit comment" />
            <div className="comment-form__actions">
              <button type="button" className="btn btn--text" onClick={() => { setEditing(false); setDraft(comment.text); }}>Cancel</button>
              <button type="submit" className="btn btn--primary" disabled={!draft.trim() || saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        ) : (
          <>
            <div className="comment__meta">
              <span className="comment__author">@{name}</span>
              <span className="comment__time">{timeAgo(comment.createdAt)}{comment.edited && " (edited)"}</span>
            </div>
            <p className="comment__text">{comment.text}</p>
          </>
        )}
      </div>
      {isOwner && !editing && (
        <div className="comment__menu" ref={menuRef}>
          <button className="icon-btn icon-btn--sm" onClick={() => setMenu((m) => !m)} aria-label="Comment actions">
            <MdMoreVert size={20} />
          </button>
          {menu && (
            <div className="menu menu--small" role="menu">
              <button className="menu__item" onClick={() => { setMenu(false); setEditing(true); }}><MdEdit size={20} /> Edit</button>
              <button className="menu__item" onClick={() => { setMenu(false); onDelete(); }}><MdDeleteOutline size={20} /> Delete</button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
