import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';
import { and, eq, inArray } from 'drizzle-orm';

@Injectable()
export class ApprovalCleanupService {
  private readonly logger = new Logger(ApprovalCleanupService.name);

  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredApprovals() {
    this.logger.log('Starting cleanup of expired approvals...');

    try {
      const currentTime = Date.now();
      this.logger.debug(`Current time: ${new Date(currentTime).toISOString()}`);

      // Find all approvals that are not accepted and have exceeded their duration
      const expiredApprovals = await this.db
        .select({
          id: schema.approvals.id,
          createdAt: schema.approvals.createdAt,
          duration: schema.approvals.duration,
          isRequestAccepted: schema.approvals.isRequestAccepted,
        })
        .from(schema.approvals)
        .where(and(eq(schema.approvals.isRequestAccepted, false)));

      this.logger.debug(
        `Found ${expiredApprovals.length} non-accepted approvals to check`,
      );

      const approvalIdsToDelete: string[] = [];

      for (const approval of expiredApprovals) {
        try {
          // Parse date from database (stored as string)
          const createdAtTime = new Date(approval.createdAt).getTime();

          const duration = approval.duration || 0;
          const expirationTime = createdAtTime + duration;

          this.logger.debug(
            `Approval ${approval.id}: created at ${new Date(createdAtTime).toISOString()}, ` +
              `duration ${duration}ms, expires at ${new Date(expirationTime).toISOString()}`,
          );

          if (currentTime > expirationTime) {
            approvalIdsToDelete.push(approval.id);
            this.logger.debug(
              `Approval ${approval.id} marked for deletion (expired)`,
            );
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to parse date for approval ${approval.id}: ${dateError.message}. Skipping this approval.`,
          );
        }
      }

      if (approvalIdsToDelete.length > 0) {
        this.logger.log(
          `Deleting ${approvalIdsToDelete.length} expired approvals`,
        );

        await this.db
          .delete(schema.approvals)
          .where(inArray(schema.approvals.id, approvalIdsToDelete));

        this.logger.log(
          `Successfully deleted ${approvalIdsToDelete.length} expired approvals`,
        );
        this.logger.debug(
          `Deleted approval IDs: ${approvalIdsToDelete.join(', ')}`,
        );
      } else {
        this.logger.log('No expired approvals found to cleanup');
      }
    } catch (error) {
      this.logger.error('Error during approval cleanup:', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
    }
  }

  async manualCleanup() {
    this.logger.log('Manual cleanup triggered...');

    try {
      const currentTime = Date.now();
      this.logger.debug(`Current time: ${new Date(currentTime).toISOString()}`);

      const expiredApprovals = await this.db
        .select({
          id: schema.approvals.id,
          createdAt: schema.approvals.createdAt,
          duration: schema.approvals.duration,
          isRequestAccepted: schema.approvals.isRequestAccepted,
        })
        .from(schema.approvals)
        .where(and(eq(schema.approvals.isRequestAccepted, false)));

      this.logger.debug(
        `Found ${expiredApprovals.length} non-accepted approvals to check`,
      );

      const approvalIdsToDelete: string[] = [];

      for (const approval of expiredApprovals) {
        try {
          const createdAtTime = new Date(approval.createdAt).getTime();

          const duration = approval.duration || 0;
          const expirationTime = createdAtTime + duration;

          this.logger.debug(
            `Approval ${approval.id}: created at ${new Date(createdAtTime).toISOString()}, ` +
              `duration ${duration}ms, expires at ${new Date(expirationTime).toISOString()}`,
          );

          if (currentTime > expirationTime) {
            approvalIdsToDelete.push(approval.id);
            this.logger.debug(
              `Approval ${approval.id} marked for deletion (expired)`,
            );
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to parse date for approval ${approval.id}: ${dateError.message}. Skipping this approval.`,
          );
        }
      }

      if (approvalIdsToDelete.length > 0) {
        this.logger.log(
          `Deleting ${approvalIdsToDelete.length} expired approvals`,
        );

        await this.db
          .delete(schema.approvals)
          .where(inArray(schema.approvals.id, approvalIdsToDelete));

        this.logger.log(
          `Successfully deleted ${approvalIdsToDelete.length} expired approvals`,
        );
        this.logger.debug(
          `Deleted approval IDs: ${approvalIdsToDelete.join(', ')}`,
        );

        return {
          deletedCount: approvalIdsToDelete.length,
          expiredApprovalIds: approvalIdsToDelete,
        };
      } else {
        this.logger.log('No expired approvals found to cleanup');
        return {
          deletedCount: 0,
          expiredApprovalIds: [],
        };
      }
    } catch (error) {
      this.logger.error('Error during manual cleanup:', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }

      throw error;
    }
  }
}
