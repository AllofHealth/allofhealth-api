import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { Body, Controller, Ip, Post } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto, UserSnippetDto } from '../dto/user.dto';
import { UserError } from '../error/user.error';
import { UserService } from '../service/user.service';

@ApiTags('User Operations')
@Controller('user')
export class UserController {
  private readonly logger = new MyLoggerService(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('createUser')
  @ApiOperation({ summary: 'Creates a new user' })
  @ApiOkResponse({
    description: 'User created successfully',
    type: UserSnippetDto,
    example: {
      status: 200,
      message: 'User created successfully',
      data: {
        id: '1234567890',
        fullName: 'John Doe',
        email: 'user@example.com',
        profilePicture: 'https://example.com/profile.jpg',
        gender: 'Male',
        role: 'PATIENT',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: UserError,
    example: {
      status: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    },
  })
  async createUser(@Ip() ip: string, @Body() ctx: CreateUserDto) {
    this.logger.log(`Create user request from ${ip}`);
    return await this.userService.createUser(ctx);
  }
}
