import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getUploadSignature(req: Request, res: Response) {
  try {
    const folder = (req.body?.folder as string) || 'niraya/uploads';
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, any> = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    return res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
    });
  } catch (err: any) {
    console.error('Cloudinary sign error:', err);
    return res.status(500).json({ message: 'Failed to create Cloudinary signature' });
  }
}
