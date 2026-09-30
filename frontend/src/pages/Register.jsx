import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { AuthInput } from "./AuthLayout.jsx";
import { authApi } from "../api/services.js";
import { useUI } from "../context/UIContext.jsx";
import { validateRegister } from "../utils/validation.js";

export default function Register() {
  const navigate = useNavigate();
  const { notify } = useUI();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined, _form: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      await authApi.register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      notify("Account created successfully. Please sign in.", "success");
      // Requirement: redirect to login after successful registration
      navigate("/login", { state: { registered: true, email: form.email.trim() } });
    } catch (err) {
      setErrors({ ...err.fieldErrors, _form: Object.keys(err.fieldErrors || {}).length ? undefined : err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create a Google Account" subtitle="Enter your details to create a YouTube account">
      <form onSubmit={onSubmit} noValidate>
        <AuthInput label="Username" name="username" autoComplete="username" value={form.username} onChange={onChange} error={errors.username} autoFocus />
        <AuthInput label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
        <div className="g-row">
          <AuthInput label="Password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={onChange} error={errors.password} />
          <AuthInput label="Confirm" name="confirmPassword" type={showPw ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
        </div>
        {!errors.password && <p className="auth__hint">Use 8 or more characters with a mix of letters and numbers</p>}
        <label className="g-check">
          <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show password
        </label>
        {errors._form && <p className="form-error">{errors._form}</p>}
        <div className="auth__actions">
          <Link to="/login" className="btn btn--text-blue">Sign in instead</Link>
          <button type="submit" className="btn btn--g" disabled={submitting}>{submitting ? "Creating..." : "Next"}</button>
        </div>
      </form>
    </AuthLayout>
  );
}
