import { Injectable } from '@nestjs/common';

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
      `${this.baseUrl}/api/v0/files/mkdir?arg=/${userId}`,
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
      throw new Error(
        `IPFS add failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log('IPFS API Response:', result);

    if (userId) {
      await this.moveToUserFolder(result.Hash, userId, result.Name);
    }

    const returnObject = {
      cid: {
        toString: () => result.Hash,
      },
      path: userId ? `/${userId}/${result.Name}` : result.Name,
      size: result.Size,
    };

    return returnObject;
  }

  async uploadImage(file: File, userId?: string): Promise<IpfsAddResult> {
    if (userId) {
      const folderExists = await this.folderExists(userId);
      if (!folderExists) {
        await this.createFolder(userId);
      }
    }

    const boundary =
      '----FormBoundary' + Math.random().toString(36).substr(2, 9);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(
        `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n`,
      ),
      Buffer.from(
        `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
      ),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const response = await fetch(`${this.baseUrl}/api/v0/add`, {
      method: 'POST',
      body,
      headers: {
        ...this.headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `IPFS image upload failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log('IPFS Image Upload Response:', result);

    if (userId) {
      await this.moveToUserFolder(result.Hash, userId, file.name);
    }

    const returnObject = {
      cid: {
        toString: () => result.Hash,
      },
      path: userId ? `/${userId}/${file.name}` : file.name,
      size: result.Size,
    };

    return returnObject;
  }

  private async moveToUserFolder(
    hash: string,
    userId: string,
    fileName: string,
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/v0/files/cp?arg=/ipfs/${hash}&arg=/${userId}/${fileName}`,
      {
        method: 'POST',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `IPFS move to user folder failed: ${response.status} ${response.statusText}`,
      );
    }
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
}
