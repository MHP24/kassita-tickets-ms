export interface FilesManagerAdapter {
  upload(fileKey: string, mimetype: string, base64: string): Promise<void>;
  download(fileKey: string): Promise<Buffer>;
}
