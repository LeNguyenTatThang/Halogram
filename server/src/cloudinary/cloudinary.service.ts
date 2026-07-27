import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large: ${file.size}. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    this.validateFile(file);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              reject(error);
              return;
            }

            resolve(result?.secure_url ?? '');
          },
        )
        .end(file.buffer);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder: string,
  ): Promise<string[]> {
    for (const file of files) {
      this.validateFile(file);
    }
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }
}
