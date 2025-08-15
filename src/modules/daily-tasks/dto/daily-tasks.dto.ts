import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum ActionType {
  ADD_HEALTH_JOURNAL = 'ADD_HEALTH_JOURNAL',
  ACCEPT_APPROVAL = 'ACCEPT_APPROVAL',
  CREATE_MEDICAL_RECORD = 'CREATE_MEDICAL_RECORD',
  COMPLETE_HEALTH_INFO = 'COMPLETE_HEALTH_INFO',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
}

export enum EntityType {
  HEALTH_JOURNAL = 'health_journal',
  APPROVAL = 'approval',
  RECORD = 'record',
  HEALTH_INFORMATION = 'health_information',
  USER = 'user',
}

export class GenerateDailyTasksDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string;
}

export class GetUserDailyTasksDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'The date to fetch tasks for (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CompleteTaskDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The type of action that triggers task completion',
    enum: ActionType,
    example: ActionType.ADD_HEALTH_JOURNAL,
  })
  @IsEnum(ActionType)
  actionType: ActionType;

  @ApiProperty({
    description: 'The unique identifier of the related entity',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  relatedEntityId: string;

  @ApiProperty({
    description: 'The type of the related entity',
    enum: EntityType,
    example: EntityType.HEALTH_JOURNAL,
  })
  @IsEnum(EntityType)
  relatedEntityType: EntityType;
}

export class GetTaskStatsDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Start date for statistics (YYYY-MM-DD format)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for statistics (YYYY-MM-DD format)',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TaskTypeDto {
  @ApiProperty({
    description: 'The unique identifier of the task type',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the task',
    example: 'Log Health Journal Entry',
  })
  name: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Add an entry to your health journal to track your daily wellness',
  })
  description: string;

  @ApiProperty({
    description: 'The action type that triggers this task',
    enum: ActionType,
    example: ActionType.ADD_HEALTH_JOURNAL,
  })
  actionType: ActionType;

  @ApiProperty({
    description: 'The roles that can perform this task',
    type: [String],
    example: ['PATIENT'],
  })
  applicableRoles: string[];

  @ApiProperty({
    description: 'The number of tokens awarded for completing this task',
    example: 5,
  })
  tokenReward: number;
}

export class DailyTaskDto {
  @ApiProperty({
    description: 'The unique identifier of the daily task',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  userId: string;

  @ApiProperty({
    description: 'The unique identifier of the task type',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  taskTypeId: string;

  @ApiProperty({
    description: 'The date this task is for (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  taskDate: string;

  @ApiProperty({
    description: 'Whether the task has been completed',
    example: false,
  })
  isCompleted: boolean;

  @ApiPropertyOptional({
    description: 'The date and time when the task was completed',
    example: '2024-01-15T10:30:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'The number of tokens awarded for completing this task',
    example: 5,
  })
  tokenReward: number;

  @ApiProperty({
    description: 'The task type details',
    type: TaskTypeDto,
  })
  taskType: TaskTypeDto;
}

export class DailyTasksResponseDto {
  @ApiProperty({
    description: 'List of daily tasks',
    type: [DailyTaskDto],
  })
  tasks: DailyTaskDto[];
}

export class TaskStatsResponseDto {
  @ApiProperty({
    description: 'Total number of tasks assigned to the user',
    example: 5,
  })
  totalTasks: number;

  @ApiProperty({
    description: 'Number of completed tasks',
    example: 3,
  })
  completedTasks: number;

  @ApiProperty({
    description: 'Total tokens earned from completed tasks',
    example: 15,
  })
  totalTokensEarned: number;

  @ApiProperty({
    description: 'Task completion rate as a percentage',
    example: 60.0,
  })
  completionRate: number;
}

export class TaskCompletionResponseDto {
  @ApiProperty({
    description: 'Whether a task was completed',
    example: true,
  })
  taskCompleted: boolean;

  @ApiProperty({
    description: 'Number of tokens awarded',
    example: 5,
  })
  tokensAwarded: number;

  @ApiPropertyOptional({
    description: 'The unique identifier of the completed task',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  taskId?: string;
}

export class CleanupTasksDto {
  @ApiPropertyOptional({
    description: 'Number of days to keep completed tasks (default: 30)',
    example: 30,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  daysToKeep?: number;
}
