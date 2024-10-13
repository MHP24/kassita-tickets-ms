import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { FilesManagerAdapter } from './files-manager.adapter.interface';
import { envs } from '../../../config';

export class FilesManager implements FilesManagerAdapter {
  private readonly s3Client = new S3Client({
    region: envs.awsS3Region,
  });

  async upload(
    fileKey: string,
    mimetype: string,
    base64: string,
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: envs.awsS3Bucket,
        Key: fileKey,
        Body: Buffer.from(base64, 'base64'),
        ContentEncoding: 'base64',
        ContentType: mimetype,
      }),
    );
  }
}
