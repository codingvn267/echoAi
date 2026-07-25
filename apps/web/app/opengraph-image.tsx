import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Helora — AI customer support that talks and chats, 24/7";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0a0a0f 0%, #0f1419 50%, #0a0a0f 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            background:
              "radial-gradient(circle, rgba(125,211,228,0.4) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
            <rect x="1" y="1" width="38" height="38" rx="10" fill="#0B0A12" />
            <rect
              x="1"
              y="1"
              width="38"
              height="38"
              rx="10"
              stroke="white"
              strokeOpacity="0.2"
            />
            <path
              d="M10.5 11.5V28.5"
              stroke="#67E8F9"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M29.5 11.5V28.5"
              stroke="#FB7185"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M11 20C14.2 15.8 17.3 15.8 20 20C22.7 24.2 25.8 24.2 29 20"
              stroke="#A78BFA"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="2.1" fill="#F8FAFC" />
          </svg>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
            Helora
          </span>
        </div>

        {/* heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontSize: 70,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            AI customer support
          </div>
          <div
            style={{
              fontSize: 70,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
              background: "linear-gradient(90deg, #7dd3e4, #a78bfa, #f472b6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            that talks and chats, 24/7
          </div>

          <div
            style={{
              marginTop: 36,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <span>Chat + Voice</span>
            <span>·</span>
            <span>Knowledge base</span>
            <span>·</span>
            <span>Multi-organization</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
