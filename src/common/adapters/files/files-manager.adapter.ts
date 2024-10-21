import {
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { FilesManagerAdapter } from './files-manager.adapter.interface';
import { envs } from '../../../config';
import { Readable } from 'stream';

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

  async download(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: envs.awsS3Bucket,
      Key: fileKey,
    });

    const response: GetObjectCommandOutput = await this.s3Client.send(command);

    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      (response.Body as Readable).on('data', (chunk) => chunks.push(chunk));
      (response.Body as Readable).on('end', () =>
        resolve(Buffer.concat(chunks)),
      );
      (response.Body as Readable).on('error', reject);
    });
  }
}
