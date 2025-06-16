import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('File validation - metadata:', metadata);
    console.log('File validation - value:', value);

    const fifteenMb = 15 * 1024 * 1024; // 15MB in bytes
    const allowedExtensions = [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'bmp',
      'webp',
      'svg',
      'tiff',
      'mp4',
    ];

    if (!value) {
      throw new BadRequestException('No file uploaded');
    }

    if (!value.size) {
      throw new BadRequestException('Invalid file - no size information');
    }

    if (value.size > fifteenMb) {
      throw new BadRequestException('File size exceeds 15MB limit');
    }

    const originalName = value.originalname || '';
    const extension = originalName.split('.').pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
      );
    }

    // Return the file object if validation passes
    return value;
  }
}
