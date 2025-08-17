import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

interface IpfsConfig {
  host: string;
  port: number;
  protocol: string;
  headers?: { authorization: string };
}

interface IpfsAddResult {
  cid: {
    toString(): string;
  };
  path: string;
  size: number;
}

@Injectable()
export class IpfsClientService {
  async createClient(config: IpfsConfig) {
    return new CustomIpfsClient(config);
  }
}

export class CustomIpfsClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(private config: IpfsConfig) {
    this.baseUrl = `${config.protocol}://${config.host}:${config.port}`;
    this.headers = config.headers ? { ...config.headers } : {};
  }

  async createFolder(userId: string): Promise<IpfsAddResult> {
    const response = await fetch(
      `${this.baseUrl}/api/v0/files/mkdir?arg=/${encodeURIComponent(userId)}&parents=true`,
      {
        method: 'POST',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `IPFS folder creation failed: ${response.status} ${response.statusText}`,
      );
    }

    // Return a mock result since mkdir doesn't return the same structure
    return {
      cid: {
        toString: () => '',
      },
      path: `/${userId}`,
      size: 0,
    };
  }

  private async folderExists(userId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v0/files/stat?arg=/${userId}`,
        {
          method: 'POST',
          headers: this.headers,
        },
      );
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v0/files/stat?arg=${encodeURIComponent(path)}`,
        {
          method: 'POST',
          headers: this.headers,
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  private async deleteFile(path: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/v0/files/rm?arg=${encodeURIComponent(path)}&force=true`,
      {
        method: 'POST',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `IPFS file deletion failed: ${response.status} ${response.statusText}`,
      );
    }
  }

  async findFileByCid(userId: string, cid: string): Promise<string | null> {
    try {
      // List all files in the user's directory
      const response = await fetch(
        `${this.baseUrl}/api/v0/files/ls?arg=/${userId}&long=true`,
        {
          method: 'POST',
          headers: this.headers,
        },
      );

      if (!response.ok) {
        console.error(`Failed to list files for user ${userId}`);
        return null;
      }

      const data = await response.json();

      // Check if any file has the matching CID
      if (data.Entries) {
        for (const entry of data.Entries) {
          if (entry.Hash === cid) {
            return `/${userId}/${entry.Name}`;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding file by CID:', error);
      return null;
    }
  }

  async deleteFileByCid(userId: string, cid: string): Promise<boolean> {
    try {
      const filePath = await this.findFileByCid(userId, cid);

      if (!filePath) {
        console.warn(`File with CID ${cid} not found in user ${userId} folder`);
        return false;
      }

      await this.deleteFile(filePath);

      await this.unpin(cid);

      console.log(`Successfully deleted file ${filePath} with CID ${cid}`);
      return true;
    } catch (error) {
      console.error(`Error deleting file by CID: ${error.message}`);
      throw error;
    }
  }

  async add(data: Buffer | string, userId?: string): Promise<IpfsAddResult> {
    if (userId) {
      const folderExists = await this.folderExists(userId);
      if (!folderExists) {
        await this.createFolder(userId);
      }
    }

    const boundary =
      '----FormBoundary' + Math.random().toString(36).substr(2, 9);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="file"; filename="file"\r\n`,
      ),
      Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const addUrl = userId
      ? `${this.baseUrl}/api/v0/add?wrap-with-directory=true&pin=true`
      : `${this.baseUrl}/api/v0/add`;

    const response = await fetch(addUrl, {
      method: 'POST',
      body,
      headers: {
        ...this.headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();

      throw new Error(
        `IPFS add failed: ${response.status} ${response.statusText}`,
      );
    }

    // Parse NDJSON response
    const text = await response.text();
    const lines = text
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    const fileEntry = lines.find((entry) => entry.Name && entry.Name !== '');

    let targetPath: string = '';

    if (userId) {
      const filePath = await this.moveToUserFolder(fileEntry.Hash, userId);
      if (filePath) {
        targetPath = filePath;
      }
    }

    return {
      cid: fileEntry.Hash,
      path: targetPath,
      size: fileEntry.Size,
    };
  }

  async uploadImage(file: Express.Multer.File, userId?: string) {
    if (userId) {
      const folderExists = await this.folderExists(userId);
      if (!folderExists) {
        await this.createFolder(userId);
      }
    }

    const boundary =
      '----FormBoundary' + Math.random().toString(36).substr(2, 9);

    // Convert Express.Multer.File to Buffer
    const buffer = fs.readFileSync(file.path);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="file"; filename="${file.originalname}"\r\n`,
      ),
      Buffer.from(
        `Content-Type: ${file.mimetype || 'application/octet-stream'}\r\n\r\n`,
      ),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const response = await fetch(
      `${this.baseUrl}/api/v0/add?wrap-with-directory=true&pin=true`,
      {
        method: 'POST',
        body,
        headers: {
          ...this.headers,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `IPFS image upload failed: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `IPFS image upload failed: ${response.status} ${response.statusText} - ${errText}`,
      );
    }

    // Parse NDJSON response
    const text = await response.text();
    const lines = text
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    const fileEntry = lines.find((entry) => entry.Name && entry.Name !== '');

    console.log('IPFS Image Upload Response:', fileEntry);

    let targetPath: string = '';

    if (userId) {
      const filePath = await this.moveToUserFolder(
        fileEntry.Hash,
        userId,
        file.originalname,
      );
      if (filePath) {
        targetPath = filePath;
      }
    }

    return {
      cid: fileEntry.Hash,
      path: userId ? targetPath : file.originalname,
      size: fileEntry.Size,
    };
  }

  private async moveToUserFolder(
    hash: string,
    userId: string,
    fileName?: string,
  ): Promise<string> {
    if (!fileName) {
      const randomText = crypto.randomUUID();
      fileName = `record-${userId}.${randomText}`;
    }

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      let targetPath = `/${userId}/${fileName}`;

      // Add timestamp and random suffix for subsequent attempts
      if (attempt > 0) {
        const randomText = crypto.randomUUID();
        const ext = fileName.includes('.')
          ? fileName.substring(fileName.lastIndexOf('.') + 1)
          : '';
        const base = fileName.includes('.')
          ? fileName.substring(0, fileName.lastIndexOf('.'))
          : fileName;
        const timestamp = Date.now();
        const newFileName = ext
          ? `${base}-${timestamp}-${attempt}.${ext}.${randomText}`
          : `${base}-${timestamp}-${attempt}.${randomText}`;
        targetPath = `/${userId}/${newFileName}`;
      }

      try {
        const response = await fetch(
          `${this.baseUrl}/api/v0/files/cp?arg=/ipfs/${hash}&arg=${encodeURIComponent(targetPath)}`,
          {
            method: 'POST',
            headers: this.headers,
          },
        );

        if (response.ok) {
          return targetPath;
        }

        const errorText = await response.text();

        // Check if the error is due to duplicate file name
        if (
          response.status === 500 &&
          errorText.includes('directory already has entry by that name')
        ) {
          attempt++;
          if (attempt < maxRetries) {
            // Wait with exponential backoff before retry
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * Math.pow(2, attempt)),
            );
            continue;
          }
        }

        // If it's not a duplicate name error or we've exceeded retries, throw the error
        throw new Error(
          `IPFS move to user folder failed: ${response.status} ${response.statusText} - ${errorText}`,
        );
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error;
        }
        attempt++;
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, attempt)),
        );
      }
    }

    throw new Error(
      `Failed to move file to user folder after ${maxRetries} attempts`,
    );
  }

  async cat(cid: string): Promise<Buffer> {
    const response = await fetch(`${this.baseUrl}/api/v0/cat?arg=${cid}`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `IPFS cat failed: ${response.status} ${response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async pin(cid: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v0/pin/add?arg=${cid}`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `IPFS pin failed: ${response.status} ${response.statusText}`,
      );
    }
  }

  async unpin(cid: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v0/pin/rm?arg=${cid}`, {
        method: 'POST',
        headers: this.headers,
      });

      if (!response.ok) {
        console.warn(
          `IPFS unpin warning: ${response.status} ${response.statusText}`,
        );
      }
    } catch (error) {
      console.warn(`Error unpinning CID ${cid}:`, error.message);
    }
  }
}
