import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prefill from ForgotPassword navigation state
  const prefilled = location.state?.emailOrPhone || "";

  const [emailOrPhone, setEmailOrPhone] = useState(prefilled);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const input = emailOrPhone.trim();
    const c = code.trim();

    if (!input) return setErrorMsg("Email or phone is required.");
    if (!c) return setErrorMsg("Reset code is required.");
    if (!newPassword || newPassword.length < 8)
      return setErrorMsg("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setErrorMsg("Passwords do not match.");

    try {
      setLoading(true);

      const res = await api.post("/auth/reset-password", {
        emailOrPhone: input,
        code: c,
        newPassword,
      });

      setSuccessMsg(
        res?.data?.message ||
          "Password reset successful. Redirecting to login..."
      );

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Request failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Reset Password</h2>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Enter your email/phone, the 6-digit code, and a new password.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Email or phone
        </label>
        <input
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          placeholder="Email or phone number"
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", marginTop: 12, marginBottom: 6 }}>
          Reset code
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", marginTop: 12, marginBottom: 6 }}>
          New password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          style={{ width: "100%", padding: 10 }}
        />

        <label style={{ display: "block", marginTop: 12, marginBottom: 6 }}>
          Confirm password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", padding: 10 }}
        />

        {errorMsg && (
          <div style={{ marginTop: 12, color: "crimson" }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ marginTop: 12, color: "green" }}>
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: 16, padding: 10 }}
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}