import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import Avatar from "../components/Avatar.jsx";
import { channelApi } from "../api/services.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { validateChannel } from "../utils/validation.js";

/** "How you'll appear" - create a channel (only reachable when signed in). */
export default function CreateChannel() {
  const { user, channel, refreshUser } = useAuth();
  const { notify } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState({ channelName: user.username, description: "", channelBanner: "", channelAvatar: user.avatar || "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // One channel per account - send existing owners straight to their channel
  if (channel) return <Navigate to={`/channel/${channel._id}`} replace />;

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
      const created = await channelApi.create(form);
      await refreshUser();
      notify("Your channel has been created", "success");
      navigate(`/channel/${created._id}`, { replace: true });
    } catch (err) {
      setErrors({ ...err.fieldErrors, _form: err.message });
      setSaving(false);
    }
  };

  return (
    <div className="create-channel">
      <form className="create-channel__card" onSubmit={onSubmit} noValidate>
        <h1>How you&apos;ll appear</h1>
        <div className="create-channel__avatar">
          <Avatar src={form.channelAvatar} name={form.channelName || user.username} size={120} />
        </div>
        <Field label="Channel name" name="channelName" value={form.channelName} onChange={onChange} error={errors.channelName} maxLength={50} />
        <Field label="Description" name="description" as="textarea" rows={3} value={form.description} onChange={onChange} error={errors.description} placeholder="Tell viewers about your channel" />
        <Field label="Profile picture URL (optional)" name="channelAvatar" value={form.channelAvatar} onChange={onChange} error={errors.channelAvatar} placeholder="https://..." />
        <Field label="Banner image URL (optional)" name="channelBanner" value={form.channelBanner} onChange={onChange} error={errors.channelBanner} placeholder="https://..." />
        {errors._form && <p className="form-error">{errors._form}</p>}
        <p className="muted small">By clicking Create channel you agree to the YouTube Terms of Service. This is a learning project.</p>
        <div className="form-actions">
          <button type="button" className="btn btn--text" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? "Creating..." : "Create channel"}</button>
        </div>
      </form>
    </div>
  );
}
