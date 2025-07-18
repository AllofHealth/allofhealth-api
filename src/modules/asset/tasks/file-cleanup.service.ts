import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);
  private readonly uploadDirectory = './uploads';

  @Cron('*/5 * * * *') // Every 5 minutes
  async cleanupUploadDirectory() {
    this.logger.log('Starting cleanup of upload directory...');

    try {
      // Check if upload directory exists
      if (!fs.existsSync(this.uploadDirectory)) {
        this.logger.warn(
          `Upload directory ${this.uploadDirectory} does not exist`,
        );
        return;
      }

      const { deletedFiles, failedFiles } = await this.recursiveCleanup(
        this.uploadDirectory,
      );

      if (deletedFiles.length > 0) {
        this.logger.log(
          `Successfully deleted ${deletedFiles.length} files from upload directory and subdirectories`,
        );
        this.logger.debug(`Deleted files: ${deletedFiles.join(', ')}`);
      }

      if (failedFiles.length > 0) {
        this.logger.warn(
          `Failed to delete ${failedFiles.length} files: ${failedFiles.join(', ')}`,
        );
      }

      if (deletedFiles.length === 0 && failedFiles.length === 0) {
        this.logger.log('No files to cleanup in upload directory');
      }
    } catch (error) {
      this.logger.error('Error during upload directory cleanup:', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }
    }
  }

  private async recursiveCleanup(
    directoryPath: string,
  ): Promise<{ deletedFiles: string[]; failedFiles: string[] }> {
    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];

    try {
      const items = await fs.promises.readdir(directoryPath);
      this.logger.debug(
        `Found ${items.length} items in directory: ${directoryPath}`,
      );

      if (items.length === 0) {
        this.logger.debug(`No items found in directory: ${directoryPath}`);
        return { deletedFiles, failedFiles };
      }

      for (const item of items) {
        try {
          const itemPath = path.join(directoryPath, item);
          const stats = await fs.promises.stat(itemPath);

          if (stats.isDirectory()) {
            this.logger.debug(`Processing subdirectory: ${item}`);
            // Recursively clean subdirectory
            const {
              deletedFiles: subDeletedFiles,
              failedFiles: subFailedFiles,
            } = await this.recursiveCleanup(itemPath);
            deletedFiles.push(...subDeletedFiles);
            failedFiles.push(...subFailedFiles);
          } else {
            // Delete the file
            await fs.promises.unlink(itemPath);
            const relativePath = path.relative(this.uploadDirectory, itemPath);
            deletedFiles.push(relativePath);
            this.logger.debug(`Deleted file: ${relativePath}`);
          }
        } catch (itemError) {
          const relativePath = path.relative(
            this.uploadDirectory,
            path.join(directoryPath, item),
          );
          failedFiles.push(relativePath);
          this.logger.warn(
            `Failed to process item ${relativePath}: ${itemError.message}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(`Error reading directory ${directoryPath}:`, error);
      throw error;
    }

    return { deletedFiles, failedFiles };
  }

  async manualCleanup() {
    this.logger.log('Manual cleanup of upload directory triggered...');

    try {
      if (!fs.existsSync(this.uploadDirectory)) {
        this.logger.warn(
          `Upload directory ${this.uploadDirectory} does not exist`,
        );
        return {
          deletedCount: 0,
          deletedFiles: [],
          failedFiles: [],
        };
      }

      const { deletedFiles, failedFiles } = await this.recursiveCleanup(
        this.uploadDirectory,
      );

      if (deletedFiles.length > 0) {
        this.logger.log(
          `Successfully deleted ${deletedFiles.length} files from upload directory and subdirectories`,
        );
        this.logger.debug(`Deleted files: ${deletedFiles.join(', ')}`);
      }

      if (failedFiles.length > 0) {
        this.logger.warn(
          `Failed to delete ${failedFiles.length} files: ${failedFiles.join(', ')}`,
        );
      }

      return {
        deletedCount: deletedFiles.length,
        deletedFiles,
        failedFiles,
      };
    } catch (error) {
      this.logger.error('Error during manual upload directory cleanup:', error);

      if (error instanceof Error) {
        this.logger.error(`Error name: ${error.name}`);
        this.logger.error(`Error message: ${error.message}`);
        this.logger.error(`Error stack: ${error.stack}`);
      }

      throw error;
    }
  }
}
