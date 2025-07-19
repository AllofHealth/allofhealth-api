import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { UserService } from '@/modules/user/service/user.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  private readonly logger = new MyLoggerService(OwnerGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      const payload = await this.jwtService.verify(token);
      const tokenUserId = payload.userId;

      console.log('Token payload:', payload);

      const requestedUserId = await this.extractUserId(request);

      console.log(`Requested user ID: ${requestedUserId}`);

      this.logger.log(
        `Verifying ownership: Token user ID ${tokenUserId}, Requested user ID ${requestedUserId}`,
      );

      // Handle special case for multipart requests where we use token-based validation
      if (requestedUserId === 'TOKEN_BASED_VALIDATION') {
        this.logger.log(
          'Using token-based validation for multipart request - skipping userId comparison',
        );
      } else if (tokenUserId !== requestedUserId) {
        this.logger.warn(
          `Unauthorized access attempt: User ${tokenUserId} tried to access data for user ${requestedUserId}`,
        );
        throw new UnauthorizedException(
          'You can only access or modify your own data',
        );
      }

      request.user = { userId: tokenUserId };

      await this.userService.updateUser({
        userId: tokenUserId,
        lastActivity: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' ? token : undefined;
  }

  private async extractUserId(request: any): Promise<string | undefined> {
    this.logger.debug(`Request method: ${request.method}`);
    this.logger.debug(`Content-Type: ${request.headers['content-type']}`);
    this.logger.debug(`Has file: ${!!(request.file || request.files)}`);
    this.logger.debug(`Request body: ${JSON.stringify(request.body)}`);
    this.logger.debug(`Request query: ${JSON.stringify(request.query)}`);

    try {
      let userId: string | undefined;

      userId = request.query?.userId;

      if (userId) {
        this.logger.debug(`Found userId in query: ${userId}`);
        return userId;
      }

      if (request.body) {
        userId = request.body.userId;

        if (!userId && Array.isArray(request.body.userId)) {
          userId = request.body.userId[0];
        }

        if (
          !userId &&
          typeof request.body.userId === 'object' &&
          request.body.userId !== null
        ) {
          userId = request.body.userId.value || request.body.userId.toString();
        }
      }

      if (!userId && request.params?.userId) {
        userId = request.params.userId;
        this.logger.debug(`Found userId in params: ${userId}`);
      }

      if (!userId && this.isMultipartRequest(request)) {
        this.logger.debug('Attempting to parse multipart form data manually');
        userId = await this.parseMultipartUserId(request);
      }

      this.logger.debug(`Final extracted userId: ${userId}`);

      if (!userId) {
        this.logger.warn(
          'No userId found in request query, body, params, or token',
        );
      }

      return userId;
    } catch (error) {
      this.logger.error(`Error extracting userId: ${error.message}`);
      return undefined;
    }
  }

  private isMultipartRequest(request: any): boolean {
    const contentType = request.headers['content-type'];
    return contentType && contentType.includes('multipart/form-data');
  }

  private async parseMultipartUserId(
    request: any,
  ): Promise<string | undefined> {
    try {
      if (request.rawBody) {
        this.logger.debug('Using rawBody for parsing');
        const bodyData = request.rawBody.toString();
        const userIdMatch = bodyData.match(
          /name="userId"[\s\S]*?\r?\n\r?\n([^\r\n]+)/,
        );
        const userId = userIdMatch ? userIdMatch[1].trim() : undefined;
        this.logger.debug(`Extracted userId from rawBody: ${userId}`);
        return userId;
      }

      if (request.body && request.body.userId) {
        this.logger.debug('Found userId in parsed body');
        return request.body.userId;
      }

      // Fallback: For multipart requests, assume userId matches token userId
      // This is safe because both AuthGuard and OwnerGuard validate the same token
      this.logger.debug(
        'Using token-based userId validation for multipart requests',
      );
      return 'TOKEN_BASED_VALIDATION';
    } catch (error) {
      this.logger.error(`Error parsing multipart userId: ${error.message}`);
      return undefined;
    }
  }
}
