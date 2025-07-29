import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import {
  EApproveRecordAccess,
  EApproveWriteRecord,
  EDeleteApproval,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { PaymasterMode } from '@biconomy/account';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import { encodeFunctionData } from 'viem';
import {
  ABI,
  ContractErrorMessages as CEM,
  ContractSuccessMessages as CSM,
  Duration,
  RewardAmount,
  TOKEN_ABI,
} from '../data/contract.data';
import {
  IAddMedicalRecordTx,
  IApprovedToAddNewRecord,
  IApproveRecordAccessTx,
  IHandleAddMedicalRecord,
  IHandleApproval,
  IViewerHasAccessToRecords,
} from '../interface/contract.interface';
import { RewardService } from '@/modules/reward/service/reward.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class ContractProvider {
  private readonly logger = new MyLoggerService(ContractProvider.name);
  constructor(
    private readonly contractConfig: ContractConfig,
    private readonly eoaService: ExternalAccountService,
    private readonly handlerService: ErrorHandler,
    private readonly aaService: AccountAbstractionService,
    private readonly rewardServicce: RewardService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private provideABI() {
    return ABI;
  }

  private async provideSigner(userId: string) {
    return this.eoaService.provideSigner(userId);
  }

  private registerPatientTx() {
    return {
      to: this.contractConfig.CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: this.provideABI(),
        functionName: 'addPatient',
      }),
    };
  }

  private registerDoctorTx(smartAddress: string) {
    const doctorAddress = smartAddress as `0x${string}`;
    return {
      to: this.contractConfig.CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: this.provideABI(),
        functionName: 'createDoctor',
        args: [doctorAddress],
      }),
    };
  }

  private approveAccessToAddNewRecordTx(
    smartAddress: string,
    patientId: number,
  ) {
    const doctorAddress = smartAddress as `0x${string}`;
    return {
      to: this.contractConfig.CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: this.provideABI(),
        functionName: 'approveAccessToAddNewRecord',
        args: [doctorAddress, patientId],
      }),
    };
  }

  private addMedicalRecordTx(ctx: IAddMedicalRecordTx) {
    const { doctorAddress, patientAddress, patientChainId, cid } = ctx;
    const doctorSmartAddress = doctorAddress as `0x${string}`;
    const patientSmartAddress = patientAddress as `0x${string}`;

    return {
      to: this.contractConfig.CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: this.provideABI(),
        functionName: 'addMedicalRecord',
        args: [doctorSmartAddress, patientSmartAddress, patientChainId, cid],
      }),
    };
  }

  private approveRecordAcessTx(ctx: IApproveRecordAccessTx) {
    const { practitionerAddress, patientChainId, recordChainId, duration } =
      ctx;
    const smartAddress = practitionerAddress as `0x${string}`;
    return {
      to: this.contractConfig.CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: this.provideABI(),
        functionName: 'approveMedicalRecordAccess',
        args: [smartAddress, patientChainId, recordChainId, duration],
      }),
    };
  }

  provideAdminContractInstance() {
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      this.eoaService.provideAdminSigner(),
    );
  }

  provideAdminTokenInstance() {
    return new ethers.Contract(
      this.contractConfig.TOKEN_ADDRESS,
      TOKEN_ABI,
      this.eoaService.provideAdminSigner(),
    );
  }

  async provideContract(userId: string) {
    const signer = await this.provideSigner(userId);
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      signer,
    );
  }

  async handleGetSystemAdminCount() {
    try {
      const contract = this.provideAdminContractInstance();
      const count = await contract.systemAdminCount();
      const data = Number(count);
      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TX_EXECUTED_SUCCESSFULLY,
        data,
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_PROVIDING_SYSTEM_ADMIN_COUNT,
      );
    }
  }

  async handleGetPatientCount() {
    try {
      const contract = this.provideAdminContractInstance();
      const count = await contract.patientCount();
      const data = Number(count);
      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TX_EXECUTED_SUCCESSFULLY,
        data,
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_PROVIDING_PATIENT_COUNT,
      );
    }
  }

  async isApprovedToAddNewRecord(ctx: IApprovedToAddNewRecord) {
    const { patientId, doctorAddress } = ctx;
    try {
      const contract = this.provideAdminContractInstance();
      const isApproved = await contract.isApprovedByPatientToAddNewRecord(
        patientId,
        doctorAddress,
      );

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TX_EXECUTED_SUCCESSFULLY,
        data: {
          isApproved,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_VERIFYING_NEW_RECORD_WRITE_PERMISSION,
      );
    }
  }

  async practitonerHasAccessToRecords(ctx: IViewerHasAccessToRecords) {
    const { practitionerAddress, patientId, recordId } = ctx;
    try {
      const contract = this.provideAdminContractInstance();
      const hasAccess = await contract.viewerHasAccessToMedicalRecord(
        practitionerAddress,
        patientId,
        recordId,
      );

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TX_EXECUTED_SUCCESSFULLY,
        data: {
          hasAccess,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_VERIFYING_PRACTITIONER_ACCESS,
      );
    }
  }

  async handleGetPatientId(patientAddress: string) {
    try {
      const contract = this.provideAdminContractInstance();
      const id = await contract.patientIds(patientAddress);

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.PATIENT_ID_FETCHED_SUCCESSFULLY,
        data: {
          patientId: Number(id),
        },
      });
    } catch (e) {
      return this.handlerService.handleError(e, CEM.ERROR_FETCHING_PATIENT_ID);
    }
  }

  async handleGetdoctorId(doctorAddress: string) {
    try {
      const contract = this.provideAdminContractInstance();
      const id = await contract.doctorIds(doctorAddress);

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.DOCTOR_ID_FETCHED_SUCCESSFULLY,
        data: {
          doctorId: Number(id),
        },
      });
    } catch (e) {
      return this.handlerService.handleError(e, CEM.ERROR_FETCHING_DOCTOR_ID);
    }
  }

  async handleRegisterPatient(userId: string) {
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);
      const tx = this.registerPatientTx();

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.PATIENT_REGISTERED_SUCCESSFULLY,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(e, CEM.ERROR_REGISTERING_PATIENT);
    }
  }

  async handleRegisterDoctor(userId: string) {
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);
      const result = await this.aaService.getSmartAddress(userId);
      if (!('data' in result && result.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: result.message,
        });
      }

      const smartAddress = result.data.smartAddress;
      const tx = this.registerDoctorTx(smartAddress);

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();
      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.DOCTOR_REGISTERED_SUCCESSFULLY,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(e, CEM.ERROR_REGISTERING_DOCTOR);
    }
  }

  @OnEvent(SharedEvents.APPROVE_WRITE_ACCESS)
  async handleApproveToAddNewRecord(ctx: EApproveWriteRecord) {
    const { userId, doctorId } = ctx;
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);

      const patientResult = await this.aaService.getSmartAddress(userId);
      const doctorResult = await this.aaService.getSmartAddress(doctorId);

      if (!('data' in patientResult && patientResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: patientResult.message,
        });
      }

      if (!('data' in doctorResult && doctorResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: doctorResult.message,
        });
      }

      const patientSmartAddress = patientResult.data.smartAddress;
      const doctorSmartAddress = doctorResult.data.smartAddress;

      const patientIdResult =
        await this.handleGetPatientId(patientSmartAddress);
      if (!('data' in patientIdResult && patientIdResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: patientIdResult.message,
        });
      }

      const patientId = patientIdResult.data.patientId;
      const approvalRequest = await this.isApprovedToAddNewRecord({
        doctorAddress: doctorSmartAddress,
        patientId,
      });

      if (!('data' in approvalRequest && approvalRequest.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: approvalRequest.message,
        });
      }

      const isApproved = approvalRequest.data.isApproved;
      if (isApproved) {
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.DOCTOR_ALREADY_APPROVED,
        });
      }

      const tx = this.approveAccessToAddNewRecordTx(
        doctorSmartAddress,
        patientId,
      );

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.DOCTOR_APPROVED_SUCCESSFULLY_TO_ADD_NEW_RECORD,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_APPROVING_ADD_NEW_RECORD,
      );
    }
  }

  async getPractitionerSmartAddress(practitionerId: string) {
    const practitionerResult =
      await this.aaService.getSmartAddress(practitionerId);

    if (!('data' in practitionerResult && practitionerResult.data)) {
      throw new BadRequestException(practitionerResult.message);
    }

    return practitionerResult.data.smartAddress;
  }

  async getPatientSmartAddress(patientId: string) {
    const patientResult = await this.aaService.getSmartAddress(patientId);

    if (!('data' in patientResult && patientResult.data)) {
      throw new BadRequestException(patientResult.message);
    }

    return patientResult.data.smartAddress;
  }

  @OnEvent(SharedEvents.APPROVE_RECORD_ACCESS)
  async handleApproveMedicalRecordAccess(ctx: EApproveRecordAccess) {
    const { practitionerId, userId, recordId, duration = Duration.A_DAY } = ctx;
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);

      const [practitionerSmartAddress, patientSmartAddress] = await Promise.all(
        [
          this.getPractitionerSmartAddress(practitionerId),
          this.getPatientSmartAddress(userId),
        ],
      );

      const patientIdResult =
        await this.handleGetPatientId(patientSmartAddress);
      if (!('data' in patientIdResult && patientIdResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: patientIdResult.message,
        });
      }

      const patientId = patientIdResult.data.patientId;
      const hasAccessResult = await this.practitonerHasAccessToRecords({
        practitionerAddress: practitionerSmartAddress,
        patientId,
        recordId,
      });

      if (!('data' in hasAccessResult && hasAccessResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: hasAccessResult.message,
        });
      }

      const hasAccess = hasAccessResult.data.hasAccess;
      if (hasAccess) {
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.VIEW_ACCESS_ALREADY_APPROVED,
        });
      }

      const tx = this.approveRecordAcessTx({
        practitionerAddress: practitionerSmartAddress,
        patientChainId: patientId,
        recordChainId: recordId,
        duration: duration,
      });

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.RECORD_ACCESS_APPROVED,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_APPROVING_RECORD_ACCESS,
      );
    }
  }

  async handleRecordApproval(ctx: IHandleApproval) {
    const {
      accessLevel,
      practitionerId,
      userId,
      recordIds = [],
      duration,
    } = ctx;

    switch (accessLevel) {
      case 'full':
        if (!recordIds || recordIds.length === 0) {
          return this.handlerService.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: CEM.RECORD_ID_REQUIRED,
          });
        }

        const result = await this.handleApproveToAddNewRecord({
          doctorId: practitionerId,
          userId,
        });

        if (!('data' in result && result.data)) {
          return this.handlerService.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: result.message,
          });
        }

        // Emit events for each record ID
        for (const recordId of recordIds) {
          this.eventEmitter.emit(
            SharedEvents.APPROVE_RECORD_ACCESS,
            new EApproveRecordAccess(
              practitionerId,
              userId,
              recordId,
              duration,
            ),
          );
        }

        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.FULL_RECORD_ACCESS_APPROVED,
        });

      case 'read':
        if (!recordIds || recordIds.length === 0) {
          return this.handlerService.handleReturn({
            status: HttpStatus.BAD_REQUEST,
            message: CEM.RECORD_ID_REQUIRED,
          });
        }

        // Emit events for each record ID
        for (const recordId of recordIds) {
          this.eventEmitter.emit(
            SharedEvents.APPROVE_RECORD_ACCESS,
            new EApproveRecordAccess(
              practitionerId,
              userId,
              recordId,
              duration,
            ),
          );
        }

        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.READ_ACCESS_APPROVED,
        });
      case 'write':
        this.eventEmitter.emit(
          SharedEvents.APPROVE_WRITE_ACCESS,
          new EApproveWriteRecord(practitionerId, userId),
        );
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.WRITE_ACCESS_APPROVED,
        });
    }
  }

  async handleAddMedicalRecord(ctx: IHandleAddMedicalRecord) {
    this.logger.debug(`Is event being received ${ctx.approvalId}`);
    const { practitionerId, userId, cid, approvalId } = ctx;
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);

      const [patientResult, practitionerResult] = await Promise.all([
        this.aaService.getSmartAddress(userId),
        this.aaService.getSmartAddress(practitionerId),
      ]);

      if (!('data' in patientResult && patientResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: patientResult.message,
        });
      }

      if (!('data' in practitionerResult && practitionerResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: practitionerResult.message,
        });
      }

      const patientSmartAddress = patientResult.data.smartAddress;
      const practitionerSmartAddress = practitionerResult.data.smartAddress;

      const patientIdResult =
        await this.handleGetPatientId(patientSmartAddress);
      if (!('data' in patientIdResult && patientIdResult.data)) {
        return this.handlerService.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: patientIdResult.message,
        });
      }

      const patientId = patientIdResult.data.patientId;

      this.logger.log(`PatientId ${patientId}`);

      const tx = this.addMedicalRecordTx({
        doctorAddress: practitionerSmartAddress,
        patientAddress: patientSmartAddress,
        patientChainId: patientId,
        cid,
      });

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();

      this.eventEmitter.emit(
        SharedEvents.DELETE_APPROVAL,
        new EDeleteApproval(approvalId),
      );

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.MEDICAL_RECORD_ADDED_SUCCESSFULLY,
        data: transactionHash,
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_ADDING_MEDICAL_RECORD,
      );
    }
  }

  async handleMint(userId: string) {
    try {
      const userAddress = await this.getPatientSmartAddress(userId);
      const contract = this.provideAdminTokenInstance();

      const tx = await contract.mint(userAddress, RewardAmount.MIN);
      await tx.wait();

      await this.rewardServicce.updateMintedState(userId, true);

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TOKEN_MINTED_SUCCESSFULLY,
      });
    } catch (e) {
      await this.rewardServicce.updateMintedState(userId, false);

      return this.handlerService.handleError(e, CEM.ERROR_MINTING_TOKEN);
    }
  }

  async handleFetchTokenBalance(userId: string) {
    try {
      const userAddress = await this.getPatientSmartAddress(userId);
      const contract = this.provideAdminTokenInstance();

      const balance = await contract.balanceOf(userAddress);
      const formattedBalance = ethers.formatEther(balance);

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TOKEN_BALANCE_FETCHED_SUCCESSFULLY,
        data: formattedBalance,
      });
    } catch (e) {
      return this.handlerService.handleError(
        e,
        CEM.ERROR_FETCHING_TOKEN_BALANCE,
      );
    }
  }
}
