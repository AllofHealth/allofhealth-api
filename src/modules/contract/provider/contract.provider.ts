import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ABI,
  ContractErrorMessages as CEM,
  ContractSuccessMessages as CSM,
} from '../data/contract.data';
import { ethers } from 'ethers';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import { encodeFunctionData } from 'viem';
import { PaymasterMode } from '@biconomy/account';

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
      if (!('data' in result) || !result.data) {
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
}
