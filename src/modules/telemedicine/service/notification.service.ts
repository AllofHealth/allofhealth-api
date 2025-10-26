import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as ics from 'ics';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private readonly resend: Resend;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        this.resend = new Resend(apiKey);
    }

    /**
     * Send booking confirmation email to patient
     */
    async sendPatientConfirmationEmail(data: {
        patientEmail: string;
        patientName: string;
        doctorName: string;
        startTime: Date;
        endTime: Date;
        videoRoomUrl: string;
        bookingReference: string;
    }) {
        try {
            this.logger.log(`Sending confirmation email to ${data.patientEmail}`);

            // Generate ICS calendar file
            const icsFile = await this.generateICSFile({
                title: `Consultation with ${data.doctorName}`,
                description: `Online consultation via AllOf Health`,
                startTime: data.startTime,
                endTime: data.endTime,
                url: data.videoRoomUrl,
            });

            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Booking Confirmed! 🎉</h2>
          
          <p>Hi ${data.patientName},</p>
          
          <p>Your consultation with <strong>${data.doctorName}</strong> has been confirmed.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Date & Time:</strong> ${data.startTime.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${this.calculateDuration(data.startTime, data.endTime)} minutes</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.videoRoomUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Video Consultation
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            💡 <strong>Tip:</strong> The calendar invite is attached to this email. Add it to your calendar so you don't miss your appointment!
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px;">
            Need to cancel or reschedule? Visit your dashboard at AllOf Health.
          </p>
        </div>
      `;

            await this.resend.emails.send({
                from: 'AllOf Health <noreply@allofhealth.com>',
                to: data.patientEmail,
                subject: `Consultation Confirmed - ${data.bookingReference}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: 'consultation.ics',
                        content: Buffer.from(icsFile),
                    },
                ],
            });

            this.logger.log('Confirmation email sent successfully');
        } catch (error) {
            this.logger.error('Failed to send confirmation email', error);
            throw error;
        }
    }

    /**
     * Send notification to doctor about new booking
     */
    async sendDoctorNotificationEmail(data: {
        doctorEmail: string;
        doctorName: string;
        patientName: string;
        startTime: Date;
        endTime: Date;
        videoRoomUrl: string;
        bookingReference: string;
    }) {
        try {
            this.logger.log(`Sending notification email to ${data.doctorEmail}`);

            const icsFile = await this.generateICSFile({
                title: `Consultation with ${data.patientName}`,
                description: `Online consultation via AllOf Health`,
                startTime: data.startTime,
                endTime: data.endTime,
                url: data.videoRoomUrl,
            });

            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Booking Received 📅</h2>
          
          <p>Hi Dr. ${data.doctorName},</p>
          
          <p>You have a new consultation booking from <strong>${data.patientName}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details</h3>
            <p><strong>Reference:</strong> ${data.bookingReference}</p>
            <p><strong>Patient:</strong> ${data.patientName}</p>
            <p><strong>Date & Time:</strong> ${data.startTime.toLocaleString()}</p>
            <p><strong>Duration:</strong> ${this.calculateDuration(data.startTime, data.endTime)} minutes</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.videoRoomUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Video Consultation
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            The calendar invite is attached. We'll send you a reminder 1 hour before the consultation.
          </p>
        </div>
      `;

            await this.resend.emails.send({
                from: 'AllOf Health <noreply@allofhealth.com>',
                to: data.doctorEmail,
                subject: `New Booking - ${data.patientName}`,
                html: emailHtml,
                attachments: [
                    {
                        filename: 'consultation.ics',
                        content: Buffer.from(icsFile),
                    },
                ],
            });

            this.logger.log('Doctor notification sent successfully');
        } catch (error) {
            this.logger.error('Failed to send doctor notification', error);
            throw error;
        }
    }

    /**
     * Send reminder email
     */
    async sendReminderEmail(data: {
        email: string;
        name: string;
        reminderType: '24h' | '1h';
        startTime: Date;
        videoRoomUrl: string;
        bookingReference: string;
    }) {
        try {
            const timeText = data.reminderType === '24h' ? '24 hours' : '1 hour';

            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Upcoming Consultation Reminder ⏰</h2>
          
          <p>Hi ${data.name},</p>
          
          <p>This is a friendly reminder that your consultation is in <strong>${timeText}</strong>.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>Consultation Time:</strong> ${data.startTime.toLocaleString()}</p>
            <p style="margin: 10px 0 0;"><strong>Reference:</strong> ${data.bookingReference}</p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${data.videoRoomUrl}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            💡 Make sure you have a stable internet connection and your camera/microphone are working.
          </p>
        </div>
      `;

            await this.resend.emails.send({
                from: 'AllOf Health <noreply@allofhealth.com>',
                to: data.email,
                subject: `Reminder: Consultation in ${timeText}`,
                html: emailHtml,
            });

            this.logger.log(`Reminder email sent to ${data.email}`);
        } catch (error) {
            this.logger.error('Failed to send reminder email', error);
            throw error;
        }
    }

    /**
     * Send cancellation email
     */
    async sendCancellationEmail(data: {
        email: string;
        name: string;
        bookingReference: string;
        refundAmount?: number;
    }) {
        try {
            const refundText = data.refundAmount
                ? `<p>A refund of <strong>$${data.refundAmount}</strong> will be processed to your original payment method within 5-7 business days.</p>`
                : '';

            const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Booking Cancelled</h2>
          
          <p>Hi ${data.name},</p>
          
          <p>Your consultation booking <strong>${data.bookingReference}</strong> has been cancelled.</p>
          
          ${refundText}
          
          <p>If you cancelled by mistake or would like to book again, please visit our website.</p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      `;

            await this.resend.emails.send({
                from: 'AllOf Health <noreply@allofhealth.com>',
                to: data.email,
                subject: `Booking Cancelled - ${data.bookingReference}`,
                html: emailHtml,
            });

            this.logger.log('Cancellation email sent successfully');
        } catch (error) {
            this.logger.error('Failed to send cancellation email', error);
            throw error;
        }
    }

    /**
     * Generate ICS calendar file
     */
    private async generateICSFile(data: {
        title: string;
        description: string;
        startTime: Date;
        endTime: Date;
        url: string;
    }): Promise<string> {
        const event: ics.EventAttributes = {
            start: this.dateToArray(data.startTime),
            end: this.dateToArray(data.endTime),
            title: data.title,
            description: data.description,
            location: data.url,
            url: data.url,
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: { name: 'AllOf Health', email: 'noreply@allofhealth.com' },
        };

        const { error, value } = ics.createEvent(event);

        if (error) {
            this.logger.error('Failed to generate ICS file', error);
            throw new Error('Failed to generate calendar file');
        }

        return value || '';
    }

    /**
     * Convert Date to ICS array format
     */
    private dateToArray(date: Date): [number, number, number, number, number] {
        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
        ];
    }

    /**
     * Calculate duration between two dates in minutes
     */
    private calculateDuration(start: Date, end: Date): number {
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    }
}
