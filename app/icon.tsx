import { ImageResponse } from "next/og"

export const runtime = "edge"

export function generateImageMetadata() {
  return [
    {
      contentType: "image/png",
      size: { width: 32, height: 32 },
      id: "small",
    },
    {
      contentType: "image/png",
      size: { width: 192, height: 192 },
      id: "medium",
    },
  ]
}

export default function Icon({ id }: { id: string }) {
  const size = id === "small" ? 32 : 192

  return new ImageResponse(
    <div
      style={{
        fontSize: size * 0.7,
        background: "linear-gradient(to bottom right, #3b82f6, #8b5cf6)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: size * 0.2,
      }}
    >
      FT
    </div>,
    { width: size, height: size },
  )
}
