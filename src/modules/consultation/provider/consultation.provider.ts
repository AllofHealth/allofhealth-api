import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as schema from '@/schemas/schema';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  ICreateConsultationType,
  IGetDoctorConsultationTypes,
  IUpdateConsultationType,
} from '../interface/consultation.interface';
import {
  CONSULTATION_ERROR_MESSAGES as CEM,
  CONSULTATION_SUCCESS_MESSAGES as CSM,
} from '../data/consultation.data';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ConsultationProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly _db: Database,
    private readonly handler: ErrorHandler,
  ) {}

  async createConsultationType(ctx: ICreateConsultationType) {
    const {
      currency,
      doctorId,
      durationMinutes,
      name,
      price,
      slug,
      description,
    } = ctx;
    try {
      const [consultationType] = await this._db
        .insert(schema.doctorConsultationTypes)
        .values({
          doctorId: doctorId,
          name: name,
          slug: slug,
          description: description,
          durationMinutes: durationMinutes,
          price: price.toString(),
          currency: currency,
          isActive: true,
        })
        .returning({
          id: schema.doctorConsultationTypes.id,
          doctorId: schema.doctorConsultationTypes.doctorId,
          name: schema.doctorConsultationTypes.name,
          description: schema.doctorConsultationTypes.description,
          durationMinutes: schema.doctorConsultationTypes.durationMinutes,
          price: schema.doctorConsultationTypes.price,
          currency: schema.doctorConsultationTypes.currency,
          calcomEventTypeId: schema.doctorConsultationTypes.calcomEventTypeId,
          isActive: schema.doctorConsultationTypes.isActive,
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_CREATING_CONSULTATION_TYPE,
        data: consultationType,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_CREATING_CONSULTATION_TYPE,
      );
    }
  }

  async getDoctorConsultationTypes(ctx: IGetDoctorConsultationTypes) {
    const { doctorId, activeOnly = true } = ctx;
    try {
      const conditions = [
        eq(schema.doctorConsultationTypes.doctorId, doctorId),
      ];

      if (activeOnly) {
        conditions.push(eq(schema.doctorConsultationTypes.isActive, true));
      }

      const consultations = await this._db
        .select()
        .from(schema.doctorConsultationTypes)
        .where(and(...conditions));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_GETTING_CONSULTATION_TYPES,
        data: consultations,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_GETTING_CONSULTATION_TYPES,
      );
    }
  }

  async updateConsultationType(ctx: IUpdateConsultationType) {
    const {
      id,
      data: { description, durationMinutes, isActive, name, price },
    } = ctx;
    try {
      const updateData: any = {};

      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (durationMinutes) updateData.durationMinutes = durationMinutes;
      if (price) updateData.price = price.toString();
      if (isActive !== undefined) updateData.isActive = isActive;

      const [consultationType] = await this._db
        .update(schema.doctorConsultationTypes)
        .set(updateData)
        .where(eq(schema.doctorConsultationTypes.id, id))
        .returning({
          id: schema.doctorConsultationTypes.id,
          name: schema.doctorConsultationTypes.name,
          description: schema.doctorConsultationTypes.description,
          durationMinutes: schema.doctorConsultationTypes.durationMinutes,
          price: schema.doctorConsultationTypes.price,
          isActive: schema.doctorConsultationTypes.isActive,
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_UPDATING_CONSULTATION_TYPE,
        data: consultationType,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_UPDATING_CONSULTATION_TYPE,
      );
    }
  }

  async findById(id: string) {
    try {
      const [consultationType] = await this._db
        .select()
        .from(schema.doctorConsultationTypes)
        .where(eq(schema.doctorConsultationTypes.id, id))
        .limit(1);

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_FINDING_CONSULTATION_TYPE,
        data: consultationType,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_FINDING_CONSULTATION_TYPE,
      );
    }
  }

  async findByCalcomEventTypeId(eventTypeId: number) {
    try {
      const [consultationType] = await this._db
        .select()
        .from(schema.doctorConsultationTypes)
        .where(
          eq(schema.doctorConsultationTypes.calcomEventTypeId, eventTypeId),
        )
        .limit(1);
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_FINDING_CONSULTATION_TYPE,
        data: consultationType,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_FINDING_CONSULTATION_TYPE,
      );
    }
  }

  async deleteConsultationType(id: string) {
    try {
      await this._db
        .delete(schema.doctorConsultationTypes)
        .where(eq(schema.doctorConsultationTypes.id, id));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: CSM.SUCCESS_DELETING_CONSULTATION_TYPE,
      });
    } catch (e) {
      this.handler.handleError(
        e,
        e.message || CEM.ERROR_DELETING_CONSULTATION_TYPE,
      );
    }
  }
}
