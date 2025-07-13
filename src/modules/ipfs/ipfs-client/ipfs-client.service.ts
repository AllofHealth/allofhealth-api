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

class CustomIpfsClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(private config: IpfsConfig) {
    this.baseUrl = `${config.protocol}://${config.host}:${config.port}`;
    this.headers = config.headers ? { ...config.headers } : {};
  }

  async add(data: Buffer | string): Promise<IpfsAddResult> {
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
        `IPFS add failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log('IPFS API Response:', result);

    const returnObject = {
      cid: {
        toString: () => result.Hash,
      },
      path: result.Name,
      size: result.Size,
    };

    return returnObject;
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
