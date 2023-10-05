import { type AssetSummary } from '@aws-sdk/client-iotsitewise';
import { type AssetDescription } from './AssetDescriptionFactory';

export function summarizeAssetDescription(assetDescription: AssetDescription) {
  return {
    assetModelId: assetDescription.assetModelId,
    id: assetDescription.assetId,
    name: assetDescription.assetName,
    arn: assetDescription.assetArn,
    status: assetDescription.assetStatus,
    hierarchies: assetDescription.assetHierarchies,
    creationDate: assetDescription.assetCreationDate,
    lastUpdateDate: assetDescription.assetLastUpdateDate,
  } as const satisfies AssetSummary;
}
