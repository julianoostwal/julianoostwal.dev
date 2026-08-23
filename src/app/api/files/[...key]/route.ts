import { NextRequest, NextResponse } from "next/server";
import { getObject, toObjectKey } from "@/lib/storage/s3";

// Objects are immutable (unique filenames), so this response can be cached hard.
const CACHE_CONTROL = "public, max-age=31536000, immutable";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = toObjectKey(key.join("/"));

  if (!objectKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const object = await getObject(objectKey);

    if (!object) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (object.etag && request.headers.get("if-none-match") === object.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { "Cache-Control": CACHE_CONTROL, ETag: object.etag },
      });
    }

    const headers = new Headers({
      "Content-Type": object.contentType,
      "Cache-Control": CACHE_CONTROL,
      "X-Content-Type-Options": "nosniff",
    });

    if (object.contentLength !== undefined) {
      headers.set("Content-Length", String(object.contentLength));
    }
    if (object.etag) headers.set("ETag", object.etag);

    return new NextResponse(object.body, { status: 200, headers });
  } catch (error) {
    console.error("Failed to serve file:", objectKey, error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
