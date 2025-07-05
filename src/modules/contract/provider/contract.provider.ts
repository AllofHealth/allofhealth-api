import { PaymasterMode } from '@biconomy/account';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { encodeFunctionData } from 'viem';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import {
  ABI,
  ContractErrorMessages as CEM,
  ContractSuccessMessages as CSM,
} from '../data/contract.data';
import {
  IApprovedToAddNewRecord,
  IHandleApproveAccessToAddNewRecord,
} from '../interface/contract.interface';

@Injectable()
export class ContractProvider {
  constructor(
    private readonly contractConfig: ContractConfig,
    private readonly eoaService: ExternalAccountService,
    private readonly handlerService: ErrorHandler,
    private readonly aaService: AccountAbstractionService,
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

  provideAdminContractInstance() {
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
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

  async handleApproveToAddNewRecord(ctx: IHandleApproveAccessToAddNewRecord) {
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
}
