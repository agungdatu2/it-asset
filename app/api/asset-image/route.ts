import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const blobUrl = req.nextUrl.searchParams.get("url");
  if (!blobUrl) return new Response("Missing url", { status: 400 });

  const res = await fetch(blobUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });

  if (!res.ok) return new Response("Not found", { status: 404 });

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
