// server\src\service\imageService.ts
import {
  S3Client,
  PutObjectCommand,
  //   GetObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

class ImageService {
  private s3Client: S3Client;
  private bucketName: string;
  private imageCache: Map<string, string>; // Cache to track original URL -> our S3 URL

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || "";
    this.imageCache = new Map();
  }

  /**
   * Processes an image URL by downloading it and storing in S3 if needed
   * @param imageUrl The original image URL
   * @returns A permanent S3 URL for the image
   */
  async processImageUrl(imageUrl: string): Promise<string> {
    // Check if we've already processed this image
    if (this.imageCache.has(imageUrl)) {
      return this.imageCache.get(imageUrl) || "";
    }

    try {
      // Generate a unique key for the image
      const fileExtension = path.extname(new URL(imageUrl).pathname) || ".jpg";
      const hash = crypto.createHash("md5").update(imageUrl).digest("hex");
      const key = `recipes/${hash}${fileExtension}`;

      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }

      const imageBuffer = await response.arrayBuffer();

      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: Buffer.from(imageBuffer),
        ContentType: response.headers.get("content-type") || "image/jpeg",
        ACL: ObjectCannedACL.public_read, // Make the object publicly readable
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      // Generate a URL for the uploaded image
      const s3Url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

      // Cache the URL mapping
      this.imageCache.set(imageUrl, s3Url);

      return s3Url;
    } catch (error) {
      console.error("Error processing image:", error);
      // Return the original URL if processing fails
      return imageUrl;
    }
  }

  /**
   * Batch process multiple image URLs
   * @param imageUrls Array of image URLs to process
   * @returns Array of processed S3 URLs
   */
  async processMultipleImages(imageUrls: string[]): Promise<string[]> {
    const promises = imageUrls.map((url) => this.processImageUrl(url));
    return Promise.all(promises);
  }
}

export default new ImageService();
