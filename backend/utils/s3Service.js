// backend/utils/s3Service.js
import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import s3Client from "../config/s3Bucket.js";

export const getSignedUrlFromKey = async (s3Key, expiresIn = 3600) => {
  if (!s3Key) throw new Error("Missing s3Key");

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

export const uploadToS3 = async ({ file, courseId, lectureId, materialId }) => {
  if (!file) throw new Error("No file provided");
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error("AWS_S3_BUCKET is not configured");
  }

  const s3Key = `courses/${courseId}/${lectureId}/${materialId}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    }),
  );

  return { s3Key, size: file.size, mimeType: file.mimetype };
};

export const deleteFromS3 = async (s3Key) => {
  if (!s3Key) return;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    }),
  );
};
