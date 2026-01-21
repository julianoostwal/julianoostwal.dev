import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const globalForS3 = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

const BUCKET_NAME = process.env.S3_BUCKET || "portfolio";

export const s3Client =
  globalForS3.s3Client ??
  new S3Client({
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

if (process.env.NODE_ENV !== "production") globalForS3.s3Client = s3Client;

export async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error: unknown) {
    const e = error as { name?: string };
    if (e.name === "NotFound" || e.name === "NoSuchBucket") {
      // Create bucket
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));

      // Set public read policy
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: BUCKET_NAME,
          Policy: JSON.stringify(policy),
        })
      );
    } else {
      throw error;
    }
  }
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  await ensureBucket();

  const objectKey = `uploads/${Date.now()}-${fileName}`;

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

  // Return the public URL
  const publicUrl = process.env.S3_ENDPOINT!;

  return `${publicUrl}/${BUCKET_NAME}/${objectKey}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract object key from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split("/");
    // Path format: /bucket/uploads/timestamp-filename
    const objectKey = pathParts.slice(2).join("/");

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
      })
    );
  } catch (error) {
    console.error("Failed to delete file from S3:", error);
    throw error;
  }
}

export async function getPresignedUploadUrl(
  fileName: string,
  _contentType: string,
  expirySeconds = 3600
): Promise<{ url: string; objectKey: string }> {
  await ensureBucket();

  const objectKey = `uploads/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: expirySeconds,
  });

  return { url, objectKey };
}

export async function getPublicUrl(objectKey: string): Promise<string> {
  const publicUrl = process.env.S3_ENDPOINT!;
  return `${publicUrl}/${BUCKET_NAME}/${objectKey}`;
}

export { BUCKET_NAME };
