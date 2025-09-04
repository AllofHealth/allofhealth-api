export enum IPFS_ERROR_MESSAGES {
  ERROR_UPLOADING_RECORD = 'Error uploading record to IPFS',
  ERROR_FETCHING_RECORD = 'Error fetching record from IPFS',
  ERROR_DELETING_RECORD = 'Error deleting record from IPFS',
  ERROR_FINDING_PATH = 'Error finding path from CID',
}

export enum IPFS_SUCCESS_MESSAGES {
  SUCCESS_UPLOADING_RECORD = 'Record uploaded successfully to IPFS',
  SUCCESS_DELETING_RECORD = 'Record deleted successfully from IPFS',
  SUCCESS_FINDING_PATH = 'Path found successfully from CID',
}
