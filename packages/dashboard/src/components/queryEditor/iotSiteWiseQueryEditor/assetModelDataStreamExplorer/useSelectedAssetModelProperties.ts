import { useEffect, useState } from 'react';
import { AssetModelPropertySummary } from '@aws-sdk/client-iotsitewise';

export const useSelectedAssetModelProperties = (initialAssetModelProperties: AssetModelPropertySummary[] = []) => {
  const [selectedAssetModelProperties, setSelectedAssetModelProperties] =
    useState<AssetModelPropertySummary[]>(initialAssetModelProperties);

  const selectedAssetModelPropertiesDependency = JSON.stringify(initialAssetModelProperties);

  useEffect(() => {
    setSelectedAssetModelProperties(initialAssetModelProperties);
  }, [selectedAssetModelPropertiesDependency, initialAssetModelProperties]);

  return [selectedAssetModelProperties, setSelectedAssetModelProperties] as const;
};

export type SelectedAssetModelProperties = ReturnType<typeof useSelectedAssetModelProperties>[0];
export type UpdateSelectedAssetModelProperties = ReturnType<typeof useSelectedAssetModelProperties>[1];

export const createInitialAssetModelProperties = (properties?: string[]) =>
  properties?.map((id) => ({ id } as AssetModelPropertySummary)) ?? [];
