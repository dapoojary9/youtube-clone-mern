import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthInput } from "./AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { validateLogin } from "../utils/validation.js";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: location.state?.email || "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const registered = location.state?.registered;

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined, _form: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validateLogin(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      notify(`Welcome back, ${user.username}`, "success");
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setErrors({ ...err.fieldErrors, _form: Object.keys(err.fieldErrors || {}).length ? undefined : err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="to continue to YouTube">
      {registered && <div className="auth__notice">Account created. Sign in with your new credentials.</div>}
      <form onSubmit={onSubmit} noValidate>
        <AuthInput label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} autoFocus />
        <AuthInput label="Password" name="password" type={showPw ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
        <label className="g-check">
          <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show password
        </label>
        {errors._form && <p className="form-error">{errors._form}</p>}
        <p className="auth__hint">Not your computer? Use a private browsing window to sign in.</p>
        <div className="auth__actions">
          <Link to="/register" className="btn btn--text-blue">Create account</Link>
          <button type="submit" className="btn btn--g" disabled={submitting}>{submitting ? "Signing in..." : "Next"}</button>
        </div>
      </form>
    </AuthLayout>
  );
}
