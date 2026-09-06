// src/app/api/admin/upload/route.ts
// Admin-only (protected by src/proxy.ts). Uploads a file to AWS S3 and returns its public URL.
//
// Requires these env vars (in .env.local locally, and in your hosting platform's
// environment variables in production): AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
// AWS_REGION, AWS_S3_BUCKET_NAME. The bucket must allow public read access via its
// bucket policy (Block Public Access must be off for this bucket, and the policy
// must grant s3:GetObject to "*") — every uploaded image is used as a plain public
// <img src> URL across the site, the same way Vercel Blob's public store worked.
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Config() {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;
  return { region, bucket, accessKeyId, secretAccessKey };
}

export async function POST(request: NextRequest) {
  const config = getS3Config();
  if (!config) {
    return NextResponse.json(
      { error: 'Image upload is not configured yet. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME to .env.local, or paste an image URL directly.' },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const client = new S3Client({
      region: config.region,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });

    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    const publicBase = process.env.AWS_S3_PUBLIC_URL_BASE; // optional: e.g. a CloudFront domain in front of the bucket
    const url = publicBase
      ? `${publicBase.replace(/\/$/, '')}/${key}`
      : `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;

    return NextResponse.json({ success: true, url });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
