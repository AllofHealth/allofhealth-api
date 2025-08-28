import { rpcUrls } from '@/modules/contract/data/contract.data';
import { IGetNextContractInstance } from '@/modules/contract/interface/contract.interface';

export class RpcRotationService {
  private urlSet: Set<string>;
  private urlUsage: Map<string, boolean>;

  constructor() {
    this.urlSet = new Set(rpcUrls);
    this.urlUsage = new Map();
    for (const url of this.urlSet) {
      this.urlUsage.set(url, false);
    }
  }

  getNextContractInstance(ctx: IGetNextContractInstance) {
    const { adminContractInstance } = ctx;
    for (const url of this.urlSet) {
      if (!this.urlUsage.get(url)) {
        this.urlUsage.set(url, true);
        return adminContractInstance(url);
      }
    }

    return null;
  }

  allUsed() {
    return Array.from(this.urlUsage.values()).every((used) => used);
  }

  returnUnused() {
    return Array.from(this.urlUsage.entries())
      .filter(([url, used]) => !used)
      .map(([url]) => url);
  }
}
