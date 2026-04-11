

import { useStoreInfo } from "../../hooks/useStoreInfo";

export default function About() {
  const { info, loading } = useStoreInfo();

  if (loading) {
    return (
      <div className="container py-5 text-center text-secondary">
        Loading…
      </div>
    );
  }

  const headline    = info?.aboutHeadline    || "About Us";
  const subheadline = info?.aboutSubheadline || "We are a modern pharmacy and skincare store.";
  const body        = info?.aboutBody        || "Focused on quality, safety, and everyday wellness.";
  const mission     = info?.aboutMission     || "";
  const vision      = info?.aboutVision      || "";
  const stat1Val    = info?.stat1Val         || "100%";
  const stat1Label  = info?.stat1Label       || "Genuine Products";
  const stat2Val    = info?.stat2Val         || "2000+";
  const stat2Label  = info?.stat2Label       || "Happy Customers";
  const stat3Val    = info?.stat3Val         || "Same Day";
  const stat3Label  = info?.stat3Label       || "Delivery";
  const phone       = info?.phone            || "";
  const email       = info?.email            || "";
  const address     = info?.address          || "";
  const hours       = info?.openingHours     || "";
  const days        = info?.openDays         || "";

  return (
    <div className="container py-5" style={{ maxWidth: 860 }}>

      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#6BBF4E", background: "#F0FDF4", border: "1px solid #bbf7d0",
          padding: "4px 12px", borderRadius: 999, display: "inline-block", marginBottom: 16,
        }}>
          Our Story
        </span>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: "#1B3D6E", marginBottom: 12 }}>
          {headline}
        </h1>
        <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.75, maxWidth: 640 }}>
          {subheadline}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48,
      }}>
        {[
          { val: stat1Val, label: stat1Label },
          { val: stat2Val, label: stat2Label },
          { val: stat3Val, label: stat3Label },
        ].map((st, i) => (
          <div key={i} style={{
            background: i % 2 === 0 ? "#EEF2F8" : "#F0FDF4",
            borderRadius: 14, padding: "24px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1B3D6E" }}>{st.val}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{
        background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16,
        padding: "32px 32px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.8, margin: 0 }}>{body}</p>
      </div>

      {/* Mission & Vision */}
      {(mission || vision) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          {mission && (
            <div style={{ background: "#EEF2F8", borderRadius: 14, padding: "24px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1B3D6E", marginBottom: 10 }}>
                Our Mission
              </div>
              <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.7, margin: 0 }}>{mission}</p>
            </div>
          )}
          {vision && (
            <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "24px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6BBF4E", marginBottom: 10 }}>
                Our Vision
              </div>
              <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.7, margin: 0 }}>{vision}</p>
            </div>
          )}
        </div>
      )}

      {/* Contact card */}
      <div style={{
        background: "#1B3D6E", borderRadius: 16, padding: "32px 32px", color: "#fff",
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Get in touch</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
          {phone && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>PHONE</div>
              <div style={{ fontWeight: 600 }}>{phone}</div>
            </div>
          )}
          {email && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>EMAIL</div>
              <div style={{ fontWeight: 600 }}>{email}</div>
            </div>
          )}
          {address && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>ADDRESS</div>
              <div style={{ fontWeight: 600 }}>{address}</div>
            </div>
          )}
          {hours && (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>HOURS</div>
              <div style={{ fontWeight: 600 }}>{hours}{days ? ` · ${days}` : ""}</div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}