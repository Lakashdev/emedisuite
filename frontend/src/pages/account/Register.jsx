import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.jpg";


function strengthLabel(pw) {
  if (!pw) return { label: "Enter a password", pct: 0 };
  let score = 0;
  if (pw.length >= 6) score += 25;
  if (pw.length >= 10) score += 25;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;

  if (score < 40) return { label: "Weak", pct: score };
  if (score < 70) return { label: "Good", pct: score };
  return { label: "Strong", pct: score };
}

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const pwStrength = useMemo(() => strengthLabel(form.password), [form.password]);

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim() && !form.phone.trim()) return "Email or phone is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
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
      await register({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        password: form.password,
      });
      nav("/profile");
    } catch (e2) {
      setErr(e2.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-grad py-5">
      <div className="container">
        <div className="row g-4 align-items-stretch">
          {/* Left: Branding / Benefits */}
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

              <h1 className="h3 fw-bold mb-2">Create your account</h1>
              <p className="text-secondary mb-4">
                Faster checkout, order tracking, and curated skincare picks — all in one place.
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
                    <div className="text-secondary small">Inside/outside ring-road fees at checkout.</div>
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
                        d="M12 1l3 6 6 .9-4.4 4.3 1 6-5.6-3-5.6 3 1-6L3 7.9 9 7l3-6z"
                        stroke="var(--brand)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="fw-semibold">Verified products</div>
                    <div className="text-secondary small">Trusted pharmacy essentials + skincare.</div>
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
                    <div className="fw-semibold">Secure account</div>
                    <div className="text-secondary small">Tokens stored safely in browser storage.</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(15,23,42,.08)" }}>
                <div className="text-secondary small">
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "var(--brand)" }}>
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="col-12 col-lg-7">
            <div className="card card-soft h-100 p-4 p-md-5">
              <div className="d-flex align-items-start justify-content-between mb-3">
                <div>
                  <div className="badge badge-soft rounded-pill px-3 py-2 mb-2">MediSuite Account</div>
                  <h2 className="h4 fw-bold mb-1">Sign up</h2>
                  <div className="text-secondary">Use email or phone. You can add address later.</div>
                </div>
              </div>

              {err ? <div className="alert alert-danger">{err}</div> : null}

              <form onSubmit={onSubmit} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Email (optional)</label>
                  <input
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Phone (optional)</label>
                  <input
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="98XXXXXXXX"
                    autoComplete="tel"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPw ? "text" : "password"}
                      className="form-control"
                      value={form.password}
                      onChange={(e) => setField("password", e.target.value)}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPw((s) => !s)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Password strength</span>
                      <span className="fw-semibold">{pwStrength.label}</span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 999 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                          width: `${pwStrength.pct}%`,
                          background: "var(--brand)",
                        }}
                      />
                    </div>
                    <div className="small text-secondary mt-2">
                      Tip: use 10+ chars, a number, and a symbol.
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Confirm password</label>
                  <div className="input-group">
                    <input
                      type={showPw2 ? "text" : "password"}
                      className="form-control"
                      value={form.confirmPassword}
                      onChange={(e) => setField("confirmPassword", e.target.value)}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPw2((s) => !s)}
                    >
                      {showPw2 ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="col-12">
                  <div
                    className="rounded-4 p-3"
                    style={{
                      background: "rgba(43,138,126,.06)",
                      border: "1px solid rgba(43,138,126,.14)",
                    }}
                  >
                    <div className="d-flex gap-2">
                      <div className="text-secondary small">
                        By creating an account, you agree to our{" "}
                        <Link to="/terms" style={{ color: "var(--brand)" }}>
                          Terms
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" style={{ color: "var(--brand)" }}>
                          Privacy Policy
                        </Link>
                        .
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 d-grid mt-2">
                  <button className="btn btn-brand rounded-pill py-2" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </div>

                <div className="col-12 text-center text-secondary small">
                  Already a member?{" "}
                  <Link to="/login" style={{ color: "var(--brand)" }}>
                    Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* tiny helper spacing on mobile */}
        <div className="py-2" />
      </div>
    </div>
  );
}
