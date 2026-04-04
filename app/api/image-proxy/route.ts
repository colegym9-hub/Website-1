import { NextRequest, NextResponse } from "next/server"

const ALLOWED_HOST = "images.pixieset.com"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) return new NextResponse("Bad Request", { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse("Invalid URL", { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const upstream = await fetch(url)
  if (!upstream.ok) {
    return new NextResponse("Upstream Error", { status: upstream.status })
  }

  const buffer = await upstream.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
