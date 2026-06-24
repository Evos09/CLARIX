import { ImageResponse } from "next/og";

export const alt = "CLARIX — Your AI Assistant for Every Meeting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0b0b14",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, display: "flex" }}>
          CLAR<span style={{ color: "#6d28d9" }}>IX</span>
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, marginTop: 24, maxWidth: 900, display: "flex", flexWrap: "wrap", gap: 12 }}>
          Your AI assistant for <span style={{ color: "#6d28d9" }}>every meeting</span>
        </div>
        <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 24 }}>
          Transcribe, analyze, and turn any meeting into action.
        </div>
      </div>
    ),
    { ...size },
  );
}
