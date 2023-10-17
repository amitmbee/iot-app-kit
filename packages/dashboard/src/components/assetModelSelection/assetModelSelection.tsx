import React from 'react';

import {
  getModelBasedQuery,
  hasModelBasedQuery,
} from '../queryEditor/iotSiteWiseQueryEditor/assetModelDataStreamExplorer/dashboardModelBasedQuery';
import { DashboardState } from '~/store/state';
import { useSelector } from 'react-redux';
import { IoTSiteWiseClient } from '@aws-sdk/client-iotsitewise';
import { AssetModelSelect } from './assetModelSelect';

type AssetModelSelectionOptions = {
  client: IoTSiteWiseClient;
};

export const AssetModelSelection = ({ client }: AssetModelSelectionOptions) => {
  const dashboardConfiguration = useSelector((dashboardState: DashboardState) => dashboardState.dashboardConfiguration);
  const shouldShow = hasModelBasedQuery(dashboardConfiguration);

  const { assetModelId, assetIds } = getModelBasedQuery(dashboardConfiguration);
  const selectedAssetId = assetIds?.at(0);

  if (!shouldShow || !assetModelId || !selectedAssetId) return null;

  return <AssetModelSelect assetModelId={assetModelId} selectedAssetId={selectedAssetId} client={client} />;
};
