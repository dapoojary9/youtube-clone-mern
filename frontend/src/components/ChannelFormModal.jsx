import { useState } from "react";
import Modal from "./Modal.jsx";
import Field from "./Field.jsx";
import { channelApi } from "../api/services.js";
import { validateChannel } from "../utils/validation.js";

/** Edit ("Customize channel") dialog for the channel owner. */
export default function ChannelFormModal({ channel, onClose, onSaved }) {
  const [form, setForm] = useState({
    channelName: channel.channelName || "",
    description: channel.description || "",
    channelBanner: channel.channelBanner || "",
    channelAvatar: channel.channelAvatar || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateChannel(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      onSaved(await channelApi.update(channel._id, form));
    } catch (err) {
      setErrors({ ...err.fieldErrors, _form: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Customize channel" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <Field label="Channel name" name="channelName" value={form.channelName} onChange={onChange} error={errors.channelName} />
        <Field label="Description" name="description" as="textarea" rows={4} value={form.description} onChange={onChange} error={errors.description} />
        <Field label="Banner image URL" name="channelBanner" value={form.channelBanner} onChange={onChange} error={errors.channelBanner} />
        <Field label="Profile picture URL" name="channelAvatar" value={form.channelAvatar} onChange={onChange} error={errors.channelAvatar} />
        {errors._form && <p className="form-error">{errors._form}</p>}
        <div className="form-actions">
          <button type="button" className="btn btn--text" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Saving..." : "Publish"}</button>
        </div>
      </form>
    </Modal>
  );
}
