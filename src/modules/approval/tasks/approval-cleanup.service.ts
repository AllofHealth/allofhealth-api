import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { APPROVAL_STATUS } from '../data/approval.data';

@Injectable()
export class ApprovalCleanupService {
  private readonly logger = new Logger(ApprovalCleanupService.name);

  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {}

  /**
   * Revokes access for expired approvals by setting their status to TIMED_OUT
   * Only processes approvals that haven't been accepted yet
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredApprovals() {
    this.logger.log('Starting cleanup of expired approvals...');

    try {
      const currentTime = Date.now();
      this.logger.debug(`Current time: ${new Date(currentTime).toISOString()}`);

      const activeApprovals = await this.db
        .select({
          id: schema.approvals.id,
          createdAt: schema.approvals.createdAt,
          duration: schema.approvals.duration,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          status: schema.approvals.status,
        })
        .from(schema.approvals)
        .where(
          and(
            eq(schema.approvals.isRequestAccepted, false),
            and(
              ne(schema.approvals.status, APPROVAL_STATUS.TIMED_OUT),
              ne(schema.approvals.status, APPROVAL_STATUS.COMPLETED),
            ),
          ),
        );

      this.logger.debug(
        `Found ${activeApprovals.length} active approvals to check`,
      );

      const approvalIdsToRevoke: string[] = [];

      for (const approval of activeApprovals) {
        try {
          const createdAtTime = new Date(approval.createdAt).getTime();
          const duration = approval.duration || 0;
          const expirationTime = createdAtTime + duration;

          this.logger.debug(
            `Approval ${approval.id}: created at ${new Date(createdAtTime).toISOString()}, ` +
              `duration ${duration}ms, expires at ${new Date(expirationTime).toISOString()}`,
          );

          if (currentTime > expirationTime) {
            approvalIdsToRevoke.push(approval.id);
            this.logger.debug(
              `Approval ${approval.id} marked for revocation (expired)`,
            );
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to parse date for approval ${approval.id}: ${dateError.message}. Skipping this approval.`,
          );
        }
      }

      if (approvalIdsToRevoke.length > 0) {
        this.logger.log(
          `Revoking access for ${approvalIdsToRevoke.length} expired approvals`,
        );

        await this.db
          .update(schema.approvals)
          .set({
            status: APPROVAL_STATUS.TIMED_OUT,
            isRequestAccepted: false,
            updatedAt: new Date().toISOString(),
          })
          .where(inArray(schema.approvals.id, approvalIdsToRevoke));

        this.logger.log(
          `Successfully revoked access for ${approvalIdsToRevoke.length} expired approvals`,
        );
        this.logger.debug(
          `Revoked approval IDs: ${approvalIdsToRevoke.join(', ')}`,
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

      const activeApprovals = await this.db
        .select({
          id: schema.approvals.id,
          createdAt: schema.approvals.createdAt,
          duration: schema.approvals.duration,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          status: schema.approvals.status,
        })
        .from(schema.approvals)
        .where(
          and(
            eq(schema.approvals.isRequestAccepted, false),
            // Only process approvals that aren't already timed out or completed
            and(
              ne(schema.approvals.status, APPROVAL_STATUS.TIMED_OUT),
              ne(schema.approvals.status, APPROVAL_STATUS.COMPLETED),
            ),
          ),
        );

      this.logger.debug(
        `Found ${activeApprovals.length} active approvals to check`,
      );

      const approvalIdsToRevoke: string[] = [];

      for (const approval of activeApprovals) {
        try {
          const createdAtTime = new Date(approval.createdAt).getTime();
          const duration = approval.duration || 0;
          const expirationTime = createdAtTime + duration;

          this.logger.debug(
            `Approval ${approval.id}: created at ${new Date(createdAtTime).toISOString()}, ` +
              `duration ${duration}ms, expires at ${new Date(expirationTime).toISOString()}`,
          );

          if (currentTime > expirationTime) {
            approvalIdsToRevoke.push(approval.id);
            this.logger.debug(
              `Approval ${approval.id} marked for revocation (expired)`,
            );
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to parse date for approval ${approval.id}: ${dateError.message}. Skipping this approval.`,
          );
        }
      }
      if (approvalIdsToRevoke.length > 0) {
        this.logger.log(
          `Revoking access for ${approvalIdsToRevoke.length} expired approvals`,
        );

        await this.db
          .update(schema.approvals)
          .set({
            status: APPROVAL_STATUS.TIMED_OUT,
            isRequestAccepted: false,
            updatedAt: new Date().toISOString(),
          })
          .where(inArray(schema.approvals.id, approvalIdsToRevoke));

        this.logger.log(
          `Successfully revoked access for ${approvalIdsToRevoke.length} expired approvals`,
        );
        this.logger.debug(
          `Revoked approval IDs: ${approvalIdsToRevoke.join(', ')}`,
        );

        return {
          revokedCount: approvalIdsToRevoke.length,
          revokedApprovalIds: approvalIdsToRevoke,
        };
      } else {
        this.logger.log('No expired approvals found to cleanup');
        return {
          revokedCount: 0,
          revokedApprovalIds: [],
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

  /**
   * Cleanup approvals that have already been accepted and expired
   * Sets their status to TIMED_OUT and revokes access
   */
  async cleanupExpiredAcceptedApprovals() {
    this.logger.log('Starting cleanup of expired accepted approvals...');

    try {
      const currentTime = Date.now();
      this.logger.debug(`Current time: ${new Date(currentTime).toISOString()}`);

      const acceptedApprovals = await this.db
        .select({
          id: schema.approvals.id,
          createdAt: schema.approvals.createdAt,
          duration: schema.approvals.duration,
          isRequestAccepted: schema.approvals.isRequestAccepted,
          status: schema.approvals.status,
        })
        .from(schema.approvals)
        .where(
          and(
            eq(schema.approvals.isRequestAccepted, true),
            ne(schema.approvals.status, APPROVAL_STATUS.COMPLETED),
          ),
        );

      this.logger.debug(
        `Found ${acceptedApprovals.length} accepted approvals to check`,
      );

      const approvalIdsToComplete: string[] = [];

      for (const approval of acceptedApprovals) {
        try {
          const createdAtTime = new Date(approval.createdAt).getTime();
          const duration = approval.duration || 0;
          const expirationTime = createdAtTime + duration;

          if (currentTime > expirationTime) {
            approvalIdsToComplete.push(approval.id);
            this.logger.debug(
              `Approval ${approval.id} marked for completion (accepted and expired)`,
            );
          }
        } catch (dateError) {
          this.logger.warn(
            `Failed to parse date for approval ${approval.id}: ${dateError.message}. Skipping this approval.`,
          );
        }
      }

      if (approvalIdsToComplete.length > 0) {
        this.logger.log(
          `Completing ${approvalIdsToComplete.length} expired accepted approvals`,
        );

        await this.db
          .update(schema.approvals)
          .set({
            status: APPROVAL_STATUS.TIMED_OUT,
            isRequestAccepted: false,
            updatedAt: new Date().toISOString(),
          })
          .where(inArray(schema.approvals.id, approvalIdsToComplete));

        this.logger.log(
          `Successfully completed ${approvalIdsToComplete.length} expired accepted approvals`,
        );
        this.logger.debug(
          `Completed approval IDs: ${approvalIdsToComplete.join(', ')}`,
        );
      } else {
        this.logger.log('No expired accepted approvals found to complete');
      }
    } catch (error) {
      this.logger.error('Error during accepted approval cleanup:', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
    }
  }
}
