import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();

  const from = loc.state?.from?.pathname || "/";

  const [mode, setMode] = useState("email"); // "email" | "phone"
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    if (mode === "email" && !form.email.trim()) return "Email is required";
    if (mode === "email" && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
    if (mode === "phone" && !form.phone.trim()) return "Phone is required";
    if (!form.password) return "Password is required";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const msg = validate();
    if (msg) {
      setErr(msg);
      return;
    }

    setLoading(true);
    try {
      const payload =
        mode === "email"
          ? { email: form.email.trim(), password: form.password }
          : { phone: form.phone.trim(), password: form.password };

      await login(payload);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-grad py-5">
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="row g-4 align-items-stretch">
          {/* Left info */}
          <div className="col-12 col-lg-5">
            <div className="card card-soft h-100 p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(43,138,126,.12)",
                    border: "1px solid rgba(43,138,126,.18)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2v20M2 12h20"
                      stroke="var(--brand)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="fw-semibold" style={{ letterSpacing: ".2px" }}>
                  <span style={{ color: "#1f6fe5" }}>Medi</span>
                  <span style={{ color: "#2bb673" }}>Suite</span>
                </div>
              </div>

              <h1 className="h3 fw-bold mb-2">Welcome back</h1>
              <p className="text-secondary mb-4">
                Login to track orders, reorder essentials, and checkout faster.
              </p>

              <div className="d-grid gap-3">
                <div className="d-flex gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 36,
                      height: 36,
                      background: "rgba(43,138,126,.10)",
                      border: "1px solid rgba(43,138,126,.15)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 7L10 17l-5-5"
                        stroke="var(--brand)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="fw-semibold">COD delivery</div>
                    <div className="text-secondary small">Ring-road pricing applied at checkout.</div>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 36,
                      height: 36,
                      background: "rgba(43,138,126,.10)",
                      border: "1px solid rgba(43,138,126,.15)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"
                        stroke="var(--brand)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="fw-semibold">Secure session</div>
                    <div className="text-secondary small">JWT access + refresh tokens.</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(15,23,42,.08)" }}>
                <div className="text-secondary small">
                  New here?{" "}
                  <Link to="/register" style={{ color: "var(--brand)" }}>
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="col-12 col-lg-7">
            <div className="card card-soft h-100 p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div className="badge badge-soft rounded-pill px-3 py-2 mb-2">Account Login</div>
                  <h2 className="h4 fw-bold mb-1">Sign in</h2>
                  <div className="text-secondary">Use email or phone number.</div>
                </div>

                <div className="btn-group" role="group" aria-label="Login mode">
                  <button
                    type="button"
                    className={`btn btn-sm ${mode === "email" ? "btn-brand" : "btn-outline-secondary"}`}
                    onClick={() => setMode("email")}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${mode === "phone" ? "btn-brand" : "btn-outline-secondary"}`}
                    onClick={() => setMode("phone")}
                  >
                    Phone
                  </button>
                </div>
              </div>

              {err ? <div className="alert alert-danger">{err}</div> : null}

              <form onSubmit={onSubmit} className="row g-3">
                {mode === "email" ? (
                  <div className="col-12">
                    <label className="form-label">Email</label>
                    <input
                      className="form-control"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                ) : (
                  <div className="col-12">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="98XXXXXXXX"
                      autoComplete="tel"
                    />
                  </div>
                )}

                <div className="col-12">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPw ? "text" : "password"}
                      className="form-control"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPw((s) => !s)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" disabled />
                    <label className="form-check-label small text-secondary" htmlFor="remember">
                      Remember me (later)
                    </label>
                  </div>

                  <Link to="/forgot-password" className="small" style={{ color: "var(--brand)" }}>
                    Forgot password?
                  </Link>
                </div>

                <div className="col-12 d-grid mt-2">
                  <button className="btn btn-brand rounded-pill py-2" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </div>

                <div className="col-12 text-center text-secondary small">
                  Don’t have an account?{" "}
                  <Link to="/register" style={{ color: "var(--brand)" }}>
                    Create one
                  </Link>
                </div>

                <div className="col-12">
                  <div
                    className="rounded-4 p-3 small text-secondary"
                    style={{
                      background: "rgba(43,138,126,.06)",
                      border: "1px solid rgba(43,138,126,.14)",
                    }}
                  >
                    Pharmacy note: Some products may require prescription. Always follow label
                    instructions.
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="py-2" />
      </div>
    </div>
  );
}
