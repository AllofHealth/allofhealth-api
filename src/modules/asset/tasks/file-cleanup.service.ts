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
        this.logger.warn(`Upload directory ${this.uploadDirectory} does not exist`);
        return;
      }

      const files = await fs.promises.readdir(this.uploadDirectory);
      this.logger.debug(`Found ${files.length} files in upload directory`);

      if (files.length === 0) {
        this.logger.log('No files found in upload directory');
        return;
      }

      const deletedFiles: string[] = [];
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.uploadDirectory, file);
          const stats = await fs.promises.stat(filePath);

          // Skip directories
          if (stats.isDirectory()) {
            this.logger.debug(`Skipping directory: ${file}`);
            continue;
          }

          await fs.promises.unlink(filePath);
          deletedFiles.push(file);
          this.logger.debug(`Deleted file: ${file}`);
        } catch (fileError) {
          failedFiles.push(file);
          this.logger.warn(`Failed to delete file ${file}: ${fileError.message}`);
        }
      }

      if (deletedFiles.length > 0) {
        this.logger.log(`Successfully deleted ${deletedFiles.length} files from upload directory`);
        this.logger.debug(`Deleted files: ${deletedFiles.join(', ')}`);
      }

      if (failedFiles.length > 0) {
        this.logger.warn(`Failed to delete ${failedFiles.length} files: ${failedFiles.join(', ')}`);
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

  async manualCleanup() {
    this.logger.log('Manual cleanup of upload directory triggered...');

    try {
      if (!fs.existsSync(this.uploadDirectory)) {
        this.logger.warn(`Upload directory ${this.uploadDirectory} does not exist`);
        return {
          deletedCount: 0,
          deletedFiles: [],
          failedFiles: [],
        };
      }

      const files = await fs.promises.readdir(this.uploadDirectory);
      this.logger.debug(`Found ${files.length} files in upload directory`);

      const deletedFiles: string[] = [];
      const failedFiles: string[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.uploadDirectory, file);
          const stats = await fs.promises.stat(filePath);

          // Skip directories
          if (stats.isDirectory()) {
            this.logger.debug(`Skipping directory: ${file}`);
            continue;
          }

          await fs.promises.unlink(filePath);
          deletedFiles.push(file);
          this.logger.debug(`Deleted file: ${file}`);
        } catch (fileError) {
          failedFiles.push(file);
          this.logger.warn(`Failed to delete file ${file}: ${fileError.message}`);
        }
      }

      if (deletedFiles.length > 0) {
        this.logger.log(`Successfully deleted ${deletedFiles.length} files from upload directory`);
        this.logger.debug(`Deleted files: ${deletedFiles.join(', ')}`);
      }

      if (failedFiles.length > 0) {
        this.logger.warn(`Failed to delete ${failedFiles.length} files: ${failedFiles.join(', ')}`);
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
