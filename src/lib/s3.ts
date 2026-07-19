import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || process.env.AWS_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
      sessionToken: process.env.S3_SESSION_TOKEN,
    },
  });
}

function getBucket() {
  return process.env.S3_BUCKET_NAME || "";
}

function getPrefix() {
  return process.env.S3_KEY_PREFIX || "";
}

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
) {
  const client = getS3Client();
  const fullKey = `${getPrefix()}uploads/${key}`;
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: fullKey,
      Body: body,
      ContentType: contentType,
    })
  );
  return fullKey;
}

export async function getDownloadUrl(key: string, expiresIn = 3600) {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}
