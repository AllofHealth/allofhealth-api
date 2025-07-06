import { Duration } from '@/modules/contract/data/contract.data';
import { IHandleApproval } from '@/modules/contract/interface/contract.interface';
import { ContractService } from '@/modules/contract/service/contract.service';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  APPROVAL_ERROR_MESSAGE as AEM,
  APPROVAL_SUCCESS_MESSAGE as ASM,
} from '../data/approval.data';

@Injectable()
export class ApprovalProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly aaService: AccountAbstractionService,
    private readonly contractService: ContractService,
  ) {}

  private async getSmartAddress(practitionerId: string) {
    const result = await this.aaService.getSmartAddress(practitionerId);

    if (!('data' in result && result.data)) {
      throw new BadRequestException(result.message);
    }

    return result.data.smartAddress;
  }

  private async practitionerCompliance(practitionerId: string) {
    let isCompliant: boolean = false;
    try {
      const practitioner = await this.db.query.user.findFirst({
        where: and(
          eq(schema.user.id, practitionerId),
          eq(schema.user.role, 'DOCTOR'),
        ),
      });

      if (practitioner) {
        isCompliant = true;
      }

      return isCompliant;
    } catch (e) {
      throw new InternalServerErrorException(
        `${AEM.ERROR_VERIFYING_PRACTITIONER}, ${e}`,
      );
    }
  }

  async createApproval(ctx: IHandleApproval) {
    const {
      practitionerId,
      userId,
      accessLevel,
      duration = Duration.A_DAY,
      recordId,
    } = ctx;
    try {
      const isPractitioner = await this.practitionerCompliance(practitionerId);
      if (!isPractitioner) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: AEM.NOT_A_VALID_PRACTITIONER,
        });
      }

      if (accessLevel === 'write' || accessLevel === 'full') {
        if (!recordId) {
          return this.handler.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: AEM.RECORD_ID_IS_REQUIRED,
          });
        }
      }

      const practitionerAddress = await this.getSmartAddress(practitionerId);
      await this.db.insert(schema.approvals).values({
        userId,
        recordId,
        practitionerAddress,
        accessLevel: accessLevel,
        duration,
      });

      const approvalContractResult =
        await this.contractService.handleRecordApproval(ctx);

      if (approvalContractResult.status !== HttpStatus.OK) {
        return this.handler.handleReturn({
          status: approvalContractResult.status,
          message: approvalContractResult.message,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.APPROVAL_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_APPROVAL);
    }
  }
}
