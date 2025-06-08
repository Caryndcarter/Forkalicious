// server\src\service\imageService.ts
import {
  S3Client,
  PutObjectCommand,
  //   GetObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

interface ImageInfo {
  image: string;
  spoonacularId: string;
}

class ImageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || "";
  }

  /**
   * Processes an image URL by downloading it and storing in S3 if needed
   * @param originalURL The original image URL
   * @returns A permanent S3 URL for the image
   */
  async processImageUrl(originalURL: string, id: string): Promise<string> {
    // Generate the target URL for the image
    const fileExtension = path.extname(new URL(originalURL).pathname) || ".jpg";
    const key = `images/${id}${fileExtension}`;
    const s3Url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    // Check if we've already processed this image
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      // If exists, return a URL (public or presigned)
      return s3Url;
    } catch (headError: any) {
      if (headError.name !== "NotFound") throw headError; // Only proceed if truly missing
    }

    try {
      // Download the image
      const response = await fetch(originalURL);
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
      return s3Url;
    } catch (error) {
      console.error("Error processing image:", error);
      // Return the original URL if processing fails
      return originalURL;
    }
  }

  /**
   * Batch process multiple image URLs
   * @param imageUrls Array of image URLs to process
   * @returns Array of processed S3 URLs
   */
  async processMultipleImages(imageKeys: ImageInfo[]): Promise<string[]> {
    const promises = imageKeys.map((imageKey) =>
      this.processImageUrl(imageKey.image, imageKey.spoonacularId)
    );
    return Promise.all(promises);
  }
}

export default new ImageService();
