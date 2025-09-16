import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { IRewardUsers } from '@/modules/reward/interface/reward.interface';
import { RewardService } from '@/modules/reward/service/reward.service';
import { ContractConfig } from '@/shared/config/smart-contract/contract.config';
import {
  EApproveRecordAccess,
  EApproveWriteRecord,
  EResetApprovalPermissions,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { AccountAbstractionService } from '@/shared/modules/account-abstraction/service/account-abstraction.service';
import { ExternalAccountService } from '@/shared/modules/external-account/service/external-account.service';
import { PaymasterMode } from '@biconomy/account';
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ethers } from 'ethers';
import { encodeFunctionData } from 'viem';
import {
  ABI,
  ContractErrorMessages as CEM,
  ContractSuccessMessages as CSM,
  Duration,
  rpcUrls,
  rpcUrlsTestnet,
  TOKEN_ABI,
} from '../data/contract.data';
import {
  IAddMedicalRecordTx,
  IApprovedToAddNewRecord,
  IApproveRecordAccessTx,
  IHandleAddMedicalRecord,
  IHandleApproval,
  ILogRegistrationFailure,
  IProcessBatchViewMedicalRecord,
  IViewerHasAccessToRecords,
  IViewMedicalRecord,
} from '../interface/contract.interface';
import { RpcRotationService } from '@/shared/utils/contract/rpc-rotation.contract';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import * as schema from '@/schemas/schema';

@Injectable()
export class ContractProvider {
  private readonly logger = new MyLoggerService(ContractProvider.name);
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
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

  private async logContractFailure(ctx: ILogRegistrationFailure) {
    const { userId, reason = 'RPC ERROR' } = ctx;
    try {
      await this.db.insert(schema.contractRegistrationFailures).values({
        userId,
        reason,
      });

      return true;
    } catch (e) {
      this.handlerService.handleError(e, CEM.ERROR_LOGGING_CONTRACT_FAILURE);
    }
  }

  provideAdminContractInstance(rpc?: string) {
    return new ethers.Contract(
      this.contractConfig.CONTRACT_ADDRESS,
      this.provideABI(),
      this.eoaService.provideAdminSigner(rpc),
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

      if (!contract) {
        throw new InternalServerErrorException('Can not instantiate contract');
      }

      try {
        const count = await contract.systemAdminCount();
        const data = Number(count);
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.TX_EXECUTED_SUCCESSFULLY,
          data,
        });
      } catch (e) {
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

            const count = await contract.systemAdminCount();
            const data = Number(count);
            return this.handlerService.handleReturn({
              status: HttpStatus.OK,
              message: CSM.TX_EXECUTED_SUCCESSFULLY,
              data,
            });
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_PROVIDING_SYSTEM_ADMIN_COUNT,
      );
    }
  }

  async handleGetPatientCount() {
    try {
      const contract = this.provideAdminContractInstance();
      if (!contract) {
        throw new InternalServerErrorException('Contract instance not found');
      }

      try {
        const count = await contract.patientCount();
        const data = Number(count);
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.TX_EXECUTED_SUCCESSFULLY,
          data,
        });
      } catch (e) {
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

            const count = await contract.patientCount();
            const data = Number(count);
            return this.handlerService.handleReturn({
              status: HttpStatus.OK,
              message: CSM.TX_EXECUTED_SUCCESSFULLY,
              data,
            });
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      this.handlerService.handleError(e, CEM.ERROR_PROVIDING_PATIENT_COUNT);
    }
  }

  async isApprovedToAddNewRecord(ctx: IApprovedToAddNewRecord) {
    const { patientId, doctorAddress } = ctx;
    try {
      const contract = this.provideAdminContractInstance();

      if (!contract) {
        throw new InternalServerErrorException('Contract instance not found');
      }

      try {
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
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

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
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      console.error(e);
      this.handlerService.handleError(
        e,
        CEM.ERROR_VERIFYING_NEW_RECORD_WRITE_PERMISSION,
      );
    }
  }

  async practitonerHasAccessToRecords(ctx: IViewerHasAccessToRecords) {
    const { practitionerAddress, patientId, recordId } = ctx;
    try {
      const contract = this.provideAdminContractInstance();
      if (!contract) {
        throw new InternalServerErrorException('Can not instantiate contract');
      }

      try {
        const hasAccess = await contract.viewerHasAccessToMedicalRecord(
          practitionerAddress,
          patientId,
          recordId,
        );

        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.TX_EXECUTED_SUCCESSFULLY,
          data: {
            hasAccess: hasAccess as boolean,
          },
        });
      } catch (e) {
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

            const hasAccess = await contract.viewerHasAccessToMedicalRecord(
              practitionerAddress,
              patientId,
              recordId,
            );

            return this.handlerService.handleReturn({
              status: HttpStatus.OK,
              message: CSM.TX_EXECUTED_SUCCESSFULLY,
              data: {
                hasAccess: hasAccess as boolean,
              },
            });
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      this.handlerService.handleError(
        e,
        CEM.ERROR_VERIFYING_PRACTITIONER_ACCESS,
      );
    }
  }

  async handleGetPatientId(patientAddress: string) {
    try {
      const contract = this.provideAdminContractInstance();
      if (!contract) {
        throw new InternalServerErrorException('Can not instantiate contract');
      }

      try {
        const id = await contract.patientIds(patientAddress);
        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.PATIENT_ID_FETCHED_SUCCESSFULLY,
          data: {
            patientId: Number(id),
          },
        });
      } catch (e) {
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

            const id = await contract.patientIds(patientAddress);
            return this.handlerService.handleReturn({
              status: HttpStatus.OK,
              message: CSM.PATIENT_ID_FETCHED_SUCCESSFULLY,
              data: {
                patientId: Number(id),
              },
            });
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      this.handlerService.handleError(e, CEM.ERROR_FETCHING_PATIENT_ID);
    }
  }

  async handleGetdoctorId(doctorAddress: string) {
    try {
      const contract = this.provideAdminContractInstance();

      if (!contract) {
        throw new InternalServerErrorException('Contract instance not found');
      }

      try {
        const id = await contract.doctorIds(doctorAddress);

        return this.handlerService.handleReturn({
          status: HttpStatus.OK,
          message: CSM.DOCTOR_ID_FETCHED_SUCCESSFULLY,
          data: {
            doctorId: Number(id),
          },
        });
      } catch (e) {
        const contractRotationProvider = new RpcRotationService();

        while (!contractRotationProvider.allUsed()) {
          try {
            const contract = contractRotationProvider.getNextContractInstance({
              adminContractInstance:
                this.provideAdminContractInstance.bind(this),
            });

            if (contract === null) {
              continue;
            }

            const id = await contract.doctorIds(doctorAddress);

            return this.handlerService.handleReturn({
              status: HttpStatus.OK,
              message: CSM.DOCTOR_ID_FETCHED_SUCCESSFULLY,
              data: {
                doctorId: Number(id),
              },
            });
          } catch (rpcError) {
            continue;
          }
        }

        throw new InternalServerErrorException('All RPC endpoints failed');
      }
    } catch (e) {
      this.handlerService.handleError(e, CEM.ERROR_FETCHING_DOCTOR_ID);
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

      if (!transactionHash) {
        await this.logContractFailure({
          userId,
        });

        throw new ContractError('Failed to register patient', {
          cause: 'Possibly rpc error',
        });
      }

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.PATIENT_REGISTERED_SUCCESSFULLY,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      await this.logContractFailure({
        userId,
        reason: e.message,
      });
      this.handlerService.handleError(e, CEM.ERROR_REGISTERING_PATIENT);
    }
  }

  async handleRegisterDoctor(userId: string) {
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);
      const result = await this.aaService.getSmartAddress(userId);
      if (!result?.data) {
        throw new Error('Failed to get smart address');
      }

      const smartAddress = result.data.smartAddress;
      const tx = this.registerDoctorTx(smartAddress);

      const opResponse = await smartWallet.sendTransaction(tx, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });

      const { transactionHash } = await opResponse.waitForTxHash();
      if (!transactionHash) {
        await this.logContractFailure({
          userId,
        });

        throw new ContractError('Failed to register doctor', {
          cause: 'Possibly rpc error',
        });
      }

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.DOCTOR_REGISTERED_SUCCESSFULLY,
        data: {
          transactionHash,
        },
      });
    } catch (e) {
      await this.logContractFailure({
        userId,
        reason: e.message,
      });
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_REGISTERING_DOCTOR,
      );
    }
  }

  @OnEvent(SharedEvents.APPROVE_WRITE_ACCESS)
  async handleApproveToAddNewRecord(ctx: EApproveWriteRecord) {
    const { userId, doctorId } = ctx;
    try {
      const smartWallet = await this.aaService.provideSmartWallet(userId);

      const patientResult = await this.aaService.getSmartAddress(userId);
      const doctorResult = await this.aaService.getSmartAddress(doctorId);

      if (!patientResult?.data) {
        throw new Error('Failed to get patient smart address');
      }

      if (!doctorResult?.data) {
        throw new Error('Failed to get doctor smart address');
      }

      const patientSmartAddress = patientResult.data.smartAddress;
      const doctorSmartAddress = doctorResult.data.smartAddress;

      const patientIdResult =
        await this.handleGetPatientId(patientSmartAddress);
      if (!patientIdResult?.data) {
        throw new Error('Failed to get patient ID');
      }

      const patientId = patientIdResult.data.patientId;
      const approvalRequest = await this.isApprovedToAddNewRecord({
        doctorAddress: doctorSmartAddress,
        patientId,
      });

      if (!approvalRequest?.data) {
        throw new Error('Failed to check approval status');
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
        e.message || CEM.ERROR_APPROVING_ADD_NEW_RECORD,
      );
    }
  }

  async getPractitionerSmartAddress(practitionerId: string) {
    const practitionerResult =
      await this.aaService.getSmartAddress(practitionerId);

    if (!practitionerResult?.data) {
      throw new BadRequestException('Failed to get practitioner smart address');
    }

    return practitionerResult.data.smartAddress;
  }

  async getPatientSmartAddress(patientId: string) {
    const patientResult = await this.aaService.getSmartAddress(patientId);

    if (!patientResult?.data) {
      throw new BadRequestException('Failed to get patient smart address');
    }

    return patientResult.data.smartAddress;
  }

  @OnEvent(SharedEvents.APPROVE_RECORD_ACCESS)
  async handleApproveMedicalRecordAccess(ctx: EApproveRecordAccess) {
    const { practitionerId, userId, recordId, duration = Duration.A_DAY } = ctx;
    this.logger.debug(`Granting read access`, recordId, duration);
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
      if (!patientIdResult?.data) {
        throw new Error('Failed to get patient ID');
      }

      const patientId = patientIdResult.data.patientId;
      const hasAccessResult = await this.practitonerHasAccessToRecords({
        practitionerAddress: practitionerSmartAddress,
        patientId,
        recordId,
      });

      if (!hasAccessResult?.data) {
        throw new Error('Failed to check access status');
      }

      const hasAccess = hasAccessResult.data.hasAccess;
      if (hasAccess) {
        throw new ConflictException(CSM.RECORD_ACCESS_APPROVED);
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
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_APPROVING_RECORD_ACCESS,
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

    this.logger.log(`Handle record approval, ${duration}, ${recordIds}`);

    switch (accessLevel) {
      case 'full':
        if (!recordIds || recordIds.length === 0) {
          throw new BadRequestException(CEM.RECORD_ID_REQUIRED);
        }

        await this.handleApproveToAddNewRecord({
          doctorId: practitionerId,
          userId,
        });

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
          throw new BadRequestException(CEM.RECORD_ID_REQUIRED);
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

      if (!patientResult?.data) {
        throw new BadRequestException('Failed to get patient smart address');
      }

      if (!practitionerResult?.data) {
        throw new BadRequestException(
          'Failed to get practitioner smart address',
        );
      }

      const patientSmartAddress = patientResult.data.smartAddress;
      const practitionerSmartAddress = practitionerResult.data.smartAddress;

      const patientIdResult =
        await this.handleGetPatientId(patientSmartAddress);
      if (!patientIdResult?.data) {
        throw new Error('Failed to get patient ID');
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

      if (!transactionHash) {
        throw new InternalServerErrorException('Failed to add medical record');
      }

      await this.eventEmitter.emitAsync(
        SharedEvents.RESET_APPROVAL_PERMISSIONS,
        new EResetApprovalPermissions(approvalId),
      );

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.MEDICAL_RECORD_ADDED_SUCCESSFULLY,
        data: transactionHash,
      });
    } catch (e) {
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_ADDING_MEDICAL_RECORD,
      );
    }
  }

  async handleMint(ctx: IRewardUsers) {
    const { userId, amount } = ctx;
    try {
      const userAddress = await this.getPatientSmartAddress(userId);
      const contract = this.provideAdminTokenInstance();

      const parsedAmount = ethers.parseEther(amount.toString());
      const tx = await contract.mint(userAddress, parsedAmount);
      await tx.wait();

      await this.rewardServicce.updateMintedState(userId, true);

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.TOKEN_MINTED_SUCCESSFULLY,
      });
    } catch (e) {
      await this.rewardServicce.updateMintedState(userId, false);

      this.handlerService.handleError(e, e.message || CEM.ERROR_MINTING_TOKEN);
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
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_FETCHING_TOKEN_BALANCE,
      );
    }
  }

  async viewMedicalRecord(ctx: IViewMedicalRecord) {
    const { userId, recordId, viewerAddress } = ctx;
    try {
      let viewer: string = '';
      const patientAddress = await this.getPatientSmartAddress(userId);
      const patientIdResult = await this.handleGetPatientId(patientAddress);
      if (!patientIdResult?.data) {
        throw new Error('Failed to get patient ID');
      }

      const patientId = patientIdResult.data.patientId;
      console.log(`patientId`);

      if (!viewerAddress) {
        viewer = patientAddress;
      } else {
        viewer = viewerAddress;
      }

      const contract = await this.provideContract(userId);
      const recordURI = await contract.viewMedicalRecord(
        recordId,
        patientId,
        viewer,
      );

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.MEDICAL_RECORD_FETCHED_SUCCESSFULLY,
        data: String(recordURI),
      });
    } catch (e) {
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_VIEWING_MEDICAL_RECORD,
      );
    }
  }

  async processBatchViewMedicalRecord(ctx: IProcessBatchViewMedicalRecord) {
    const { userId, recordIds, viewerAddress } = ctx;
    try {
      let recordURIS: string[] = [];

      for (const recordId of recordIds) {
        const recordResult = await this.viewMedicalRecord({
          recordId,
          userId,
          viewerAddress,
        });

        if (!recordResult?.data) {
          this.logger.warn(`can not fetch record for this id`);
          continue;
        }

        recordURIS.push(recordResult.data);
      }

      return this.handlerService.handleReturn({
        status: HttpStatus.OK,
        message: CSM.MEDICAL_RECORD_FETCHED_SUCCESSFULLY,
        data: recordURIS,
      });
    } catch (e) {
      this.handlerService.handleError(
        e,
        e.message || CEM.ERROR_PROCESSING_BATCH_VIEW_MEDICAL_RECORDS,
      );
    }
  }
}
