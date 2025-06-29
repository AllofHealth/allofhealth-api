import { Injectable } from '@nestjs/common';
import { ContractProvider } from '../provider/contract.provider';

@Injectable()
export class ContractService {
  constructor(private readonly contractProvider: ContractProvider) {}
}
