import { S3Client, PutObjectCommand, ListBucketsCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const variants = [
  { name: "as-configured (eu-central-1, path)", region: "eu-central-1", forcePathStyle: true },
  { name: "us-east-1, path",                    region: "us-east-1",    forcePathStyle: true },
  { name: "us-east-1, virtual-host",            region: "us-east-1",    forcePathStyle: false },
  { name: "eu-central-1, virtual-host",         region: "eu-central-1", forcePathStyle: false },
];

for (const v of variants) {
  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: v.region,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: v.forcePathStyle,
  });
  console.log(`\n=== ${v.name} ===`);
  try {
    const r = await s3.send(new ListBucketsCommand({}));
    console.log("ListBuckets OK. Buckets:", r.Buckets?.map(b => b.Name));
  } catch (e) {
    console.log("ListBuckets FAIL:", e.name, "/", e.Code || "-", "/", e.message);
  }
  try {
    await s3.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET }));
    console.log("HeadBucket OK");
  } catch (e) {
    console.log("HeadBucket FAIL:", e.name, "status:", e.$metadata?.httpStatusCode, e.message);
  }
}
