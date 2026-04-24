import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "echoAi — AI customer support that talks and chats, 24/7";
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
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              background: "rgba(125,211,228,0.18)",
              border: "1px solid rgba(125,211,228,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7dd3e4",
              fontWeight: 700,
              fontSize: 32,
            }}
          >
            e
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>echoAi</span>
        </div>

        {/* heading */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontSize: 70, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
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
    { ...size },
  );
}
