import { AdminGuard } from '@/modules/admin/guard/admin.guard';
import { AuthGuard } from '@/modules/auth/guards/auth.guard';
import { OwnerGuard } from '@/modules/user/guard/user.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CompleteTaskDto,
  DailyTasksResponseDto,
  GenerateDailyTasksDto,
  TaskCompletionResponseDto,
  TaskStatsResponseDto,
} from '../dto/daily-tasks.dto';
import { DailyTasksService } from '../service/daily-tasks.service';
import { SuspensionGuard } from '@/modules/auth/guards/suspension.guard';

@ApiTags('Daily Tasks Operations')
@Controller('daily-tasks')
@ApiBearerAuth()
export class DailyTasksController {
  constructor(private readonly dailyTasksService: DailyTasksService) {}

  @Post('generateDailyTasks')
  @UseGuards(OwnerGuard)
  @ApiOperation({
    summary: 'Generate daily tasks for a user',
    description:
      'Creates up to 5 daily tasks for a user based on their role. If tasks already exist for today, returns existing tasks.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily tasks generated successfully',
    type: DailyTasksResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async generateDailyTasks(@Body() ctx: GenerateDailyTasksDto) {
    return await this.dailyTasksService.generateUserTasks(ctx);
  }

  @Get('userDailyTasks')
  @UseGuards(AuthGuard, SuspensionGuard, OwnerGuard)
  @ApiOperation({
    summary: 'Get user daily tasks',
    description:
      'Retrieves daily tasks for a specific user and date. If no date is provided, returns tasks for today.',
  })
  @ApiQuery({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'date',
    description: 'The date to fetch tasks for (YYYY-MM-DD format)',
    example: '2024-01-15',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Daily tasks retrieved successfully',
    type: DailyTasksResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getUserDailyTasks(
    @Query('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return await this.dailyTasksService.getUserTasks({
      userId,
      date,
    });
  }

  @Post('completeDailyTask')
  @UseGuards(AuthGuard, SuspensionGuard, AdminGuard)
  @ApiOperation({
    summary: 'Complete a daily task',
    description:
      'Marks a daily task as completed when a user performs the corresponding action. Awards tokens and updates reward counters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task completed successfully',
    type: TaskCompletionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async completeTask(@Body() ctx: CompleteTaskDto) {
    return await this.dailyTasksService.completeTask(ctx);
  }

  @Get('userDailyStats')
  @UseGuards(AuthGuard, SuspensionGuard, AdminGuard)
  @ApiOperation({
    summary: 'Get task statistics',
    description:
      'Retrieves task completion statistics for a user including total tasks, completed tasks, tokens earned, and completion rate.',
  })
  @ApiQuery({
    name: 'userId',
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date for statistics (YYYY-MM-DD format)',
    example: '2024-01-01',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date for statistics (YYYY-MM-DD format)',
    example: '2024-01-31',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task statistics retrieved successfully',
    type: TaskStatsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async getTaskStats(
    @Query('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dailyTasksService.getUserTaskStats({
      userId,
      startDate,
      endDate,
    });
  }

  @Post('initialize-task-types')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Initialize default task types',
    description:
      'Creates default task types in the database. This should be called once during initial setup.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task types initialized successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async initializeTaskTypes() {
    return await this.dailyTasksService.initializeTaskTypes();
  }

  @Delete('cleanup')
  @ApiOperation({
    summary: 'Clean up old completed tasks',
    description:
      'Removes old completed tasks from the database to maintain performance. This is a maintenance operation.',
  })
  @ApiQuery({
    name: 'daysToKeep',
    description: 'Number of days to keep completed tasks (default: 30)',
    example: 30,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Old tasks cleaned up successfully',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async cleanupOldTasks(@Query('daysToKeep') daysToKeep?: number) {
    return await this.dailyTasksService.cleanupOldTasks(daysToKeep || 30);
  }
}
