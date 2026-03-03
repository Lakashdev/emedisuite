import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const input = emailOrPhone.trim();
    if (!input) {
      setErrorMsg("Email or phone is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { emailOrPhone: input });

      setSuccessMsg("If the account exists, a reset code has been sent.");

      // ✅ redirect to reset page + prefill email/phone
      setTimeout(() => {
        navigate("/reset-password", { state: { emailOrPhone: input } });
      }, 600);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Request failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Forgot Password</h2>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Enter your email or phone and we’ll send a 6-digit reset code.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Email or phone</label>
        <input
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          placeholder="Email or phone number"
          style={{ width: "100%", padding: 10 }}
        />

        {errorMsg && <div style={{ marginTop: 12, color: "crimson" }}>{errorMsg}</div>}
        {successMsg && <div style={{ marginTop: 12, color: "green" }}>{successMsg}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", marginTop: 16, padding: 10 }}
        >
          {loading ? "Sending..." : "Send code"}
        </button>
      </form>
    </div>
  );
}