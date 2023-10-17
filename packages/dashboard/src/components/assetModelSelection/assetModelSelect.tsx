import React from 'react';

import { AssetForAssetModelSelect } from '../queryEditor/iotSiteWiseQueryEditor/assetModelDataStreamExplorer/assetsForAssetModelSelect/assetForAssetModelSelect';
import { AssetSummary, IoTSiteWiseClient } from '@aws-sdk/client-iotsitewise';
import { useAssetsForAssetModel } from '../queryEditor/iotSiteWiseQueryEditor/assetModelDataStreamExplorer/assetsForAssetModelSelect/useAssetsForAssetModel/useAssetsForAssetModel';
import { useModelBasedWidgets } from '../queryEditor/iotSiteWiseQueryEditor/assetModelDataStreamExplorer/useModelBasedWidgets';

type AssetModelSelectOptions = {
  client: IoTSiteWiseClient;
  assetModelId: string;
  selectedAssetId: string;
};
export const AssetModelSelect = ({ client, assetModelId, selectedAssetId }: AssetModelSelectOptions) => {
  const { widgets, update } = useModelBasedWidgets();

  const { assetSummaries } = useAssetsForAssetModel({ assetModelId, client, fetchAll: true });

  const selectedAsset = assetSummaries.find(({ id }) => id === selectedAssetId);

  const onChangeSelectedAsset = (assetSummary: AssetSummary | undefined) => {
    const id = assetSummary?.id;
    if (!id) return;

    const updateWidgets = widgets.map(({ properties, ...rest }) => {
      const assetModels = properties.queryConfig.query?.assetModels ?? [];
      return {
        ...rest,
        properties: {
          ...properties,
          queryConfig: {
            ...properties.queryConfig,
            query: {
              ...properties.queryConfig.query,
              assetModels: assetModels.map((assetModel) => ({
                ...assetModel,
                assetIds: [id],
              })),
            },
          },
        },
      };
    });

    update(updateWidgets);
  };

  return (
    <AssetForAssetModelSelect
      assetModelId={assetModelId}
      selectedAsset={selectedAsset}
      onSelectAsset={onChangeSelectedAsset}
      client={client}
    />
  );
};
