import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { SuccessResponseDto } from '@/shared/dtos/shared.dto';
import { Body, Controller, HttpStatus, Ip, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  USER_ERROR_MESSAGES as UEM,
  USER_SUCCESS_MESSAGE as USM,
} from '../data/user.data';
import { UpdateUserDto } from '../dto/user.dto';
import { UserError } from '../error/user.error';
import { UserService } from '../service/user.service';

@ApiTags('User Operations')
@Controller('user')
export class UserController {
  private readonly logger = new MyLoggerService(UserController.name);
  constructor(private readonly userService: UserService) {}

  @Post('updateUser')
  @ApiOperation({ summary: 'Updates an existing user' })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: SuccessResponseDto,
    example: {
      status: 200,
      message: USM.USER_UPDATED,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: UserError,
    example: {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: UEM.ERROR_UPDATING_USER,
    },
  })
  @ApiConflictResponse({
    description: UEM.EMAIL_EXIST,
    example: {
      status: HttpStatus.CONFLICT,
      message: UEM.EMAIL_EXIST,
    },
  })
  @ApiBadRequestResponse({
    description: UEM.INVALID_ROLE,
    example: {
      status: HttpStatus.BAD_REQUEST,
      message: UEM.INVALID_ROLE,
    },
  })
  async updateUser(@Ip() ip: string, @Body() ctx: UpdateUserDto) {
    this.logger.log(`Updating user ${ctx.userId} from ${ip} `);
    return this.userService.updateUser(ctx);
  }
}
