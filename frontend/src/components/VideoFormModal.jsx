import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import Field from "./Field.jsx";
import { videoApi } from "../api/services.js";
import { validateVideo } from "../utils/validation.js";
import { getYouTubeId } from "../utils/format.js";

const EMPTY = { title: "", description: "", videoUrl: "", thumbnailUrl: "", category: "" };

/** Upload (create) or edit a video. Calls onSaved(video) on success. */
export default function VideoFormModal({ video, channelId, onClose, onSaved }) {
  const isEdit = !!video;
  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...video } : EMPTY);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    videoApi.categories().then(setCategories).catch(() => {});
  }, []);

  const ytId = getYouTubeId(form.videoUrl);
  const preview = form.thumbnailUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateVideo(form, !!ytId);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    setServerError("");
    const payload = {
      title: form.title.trim(),
      description: form.description,
      videoUrl: form.videoUrl.trim(),
      thumbnailUrl: form.thumbnailUrl.trim(),
      category: form.category,
    };
    try {
      const saved = isEdit ? await videoApi.update(video._id, payload) : await videoApi.create({ ...payload, channelId });
      onSaved(saved, isEdit);
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit video details" : "Upload video"} onClose={onClose} width={760}>
      <form className="video-form" onSubmit={onSubmit} noValidate>
        <div className="video-form__fields">
          <Field label="Title (required)" name="title" value={form.title} onChange={onChange} error={errors.title} placeholder="Add a title that describes your video" maxLength={100} />
          <Field label="Description" name="description" as="textarea" rows={4} value={form.description} onChange={onChange} error={errors.description} placeholder="Tell viewers about your video" />
          <Field label="Video URL (required)" name="videoUrl" value={form.videoUrl} onChange={onChange} error={errors.videoUrl} placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4" hint="Paste a YouTube link or a direct .mp4/.webm file URL" />
          <Field label="Thumbnail URL" name="thumbnailUrl" value={form.thumbnailUrl} onChange={onChange} error={errors.thumbnailUrl} placeholder="https://.../thumbnail.jpg" hint={ytId ? "Optional - YouTube's thumbnail is used if left empty" : "Required for non-YouTube videos"} />
          <Field label="Category (required)" name="category" as="select" value={form.category} onChange={onChange} error={errors.category}>
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </Field>
        </div>
        <aside className="video-form__preview">
          <div className="preview-thumb">
            {preview ? <img src={preview} alt="Thumbnail preview" /> : <span>Thumbnail preview</span>}
          </div>
          <p className="preview-title">{form.title || "Your video title"}</p>
          <p className="preview-sub">{form.category || "Category"}</p>
        </aside>
        {serverError && <p className="form-error">{serverError}</p>}
        <div className="form-actions video-form__actions">
          <button type="button" className="btn btn--text" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Upload"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
