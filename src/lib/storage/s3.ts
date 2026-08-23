import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

const BUCKET_NAME = process.env.S3_BUCKET!;

/** Prefix every uploaded object shares. Also the only prefix the proxy will serve. */
export const UPLOAD_PREFIX = "uploads/";

/** Public path the app serves objects on. Stored in the database, never a raw S3 URL. */
export const FILE_ROUTE = "/api/files/";

export const s3Client =
  globalForS3.s3Client ??
  new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  });

if (process.env.NODE_ENV !== "production") globalForS3.s3Client = s3Client;

/**
 * Turn whatever is stored in the database into a bare object key.
 *
 * Accepts the current form ("/api/files/uploads/123-foo.webp"), a bare key
 * ("uploads/123-foo.webp"), and the legacy public form left over from the
 * SeaweedFS era ("https://host/bucket/uploads/123-foo.webp").
 */
export function toObjectKey(stored: string): string | null {
  let path = stored;

  if (/^https?:\/\//i.test(stored)) {
    try {
      path = new URL(stored).pathname;
    } catch {
      return null;
    }
  }

  path = path.replace(/^\/+/, "");

  if (path.startsWith("api/files/")) path = path.slice("api/files/".length);
  // Legacy path-style URLs carried the bucket as the first segment.
  if (path.startsWith(`${BUCKET_NAME}/`)) path = path.slice(BUCKET_NAME.length + 1);

  if (!path.startsWith(UPLOAD_PREFIX)) return null;
  if (path.includes("..")) return null;

  return path;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const objectKey = `${UPLOAD_PREFIX}${Date.now()}-${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: file,
      ContentType: contentType,
      // Cache for 1 year since we use unique filenames
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${FILE_ROUTE}${objectKey}`;
}

/** Fetch an object for the proxy route. Returns null when it does not exist. */
export async function getObject(objectKey: string) {
  try {
    const result = await s3Client.send(
      new GetObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey })
    );

    if (!result.Body) return null;

    return {
      body: result.Body.transformToWebStream(),
      contentType: result.ContentType ?? "application/octet-stream",
      contentLength: result.ContentLength,
      etag: result.ETag,
    };
  } catch (error: unknown) {
    const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return null;
    throw error;
  }
}

export async function deleteFile(storedUrl: string): Promise<void> {
  const objectKey = toObjectKey(storedUrl);

  if (!objectKey) {
    console.warn("Refusing to delete unrecognised storage reference:", storedUrl);
    return;
  }

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
    })
  );
}

export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  expirySeconds = 3600
): Promise<{ url: string; objectKey: string }> {
  const objectKey = `${UPLOAD_PREFIX}${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expirySeconds,
  });

  return { url, objectKey };
}

export function getPublicUrl(objectKey: string): string {
  return `${FILE_ROUTE}${objectKey}`;
}

export { BUCKET_NAME };
