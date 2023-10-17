import React, { useCallback, useEffect } from 'react';

import { type IoTSiteWiseClient, AssetSummary } from '@aws-sdk/client-iotsitewise';

import Box from '@cloudscape-design/components/box';

import { AssetModelExplorer } from './assetModelExplorer/assetModelExplorer';
import { AssetModelPropertiesExplorer } from './assetModelPropertiesExplorer/assetModelPropertiesExplorer';
import { createInitialAssetModelSummary, useSelectedAssetModel } from './useSelectedAssetModel';
import { HorizontalDivider } from '~/components/divider/horizontalDivider';
import { createInitialAssetModelProperties, useSelectedAssetModelProperties } from './useSelectedAssetModelProperties';
import { AssetModelDataStreamSave } from './assetModelDataStreamSave';
import { createInitialAsset, useSelectedAsset } from './useSelectedAsset';
import { useSelection } from '~/customization/propertiesSection';
import { createAssetModelQuery } from './createAssetModelQuery';
import { createNonNullableList } from '~/helpers/lists/createNonNullableList';
import { getAssetModelQueryInformation } from './getAssetModelQueryInformation';
import { isJust, maybeWithDefault } from '~/util/maybe';
import { AssetModelQuery, SiteWiseAssetModelQuery } from '@iot-app-kit/source-iotsitewise';
import { noop } from 'lodash';
import { QueryConfigWidget, getModelBasedQuery, isQueryWidget } from './dashboardModelBasedQuery';
import { DashboardState } from '~/store/state';
import { useSelector } from 'react-redux';
import { useModelBasedWidgets } from './useModelBasedWidgets';
import { styledQueryWidgetOnDrop } from '../../useQuery';
import { QueryProperties } from '~/customization/widgets/types';
import { assignDefaultStyles } from '~/customization/widgets/utils/assignDefaultStyleSettings';
import { IoTSiteWiseDataStreamQuery } from '~/types';

export interface AssetModelDataStreamExplorerProps {
  client: IoTSiteWiseClient;
}

export const AssetModelDataStreamExplorer = ({ client }: AssetModelDataStreamExplorerProps) => {
  const { widgets, update } = useModelBasedWidgets();
  const dashboardConfiguration = useSelector((dashboardState: DashboardState) => dashboardState.dashboardConfiguration);
  const selection = useSelection({ filter: isQueryWidget });

  // const widgetTypesInSelection = selection?.types ?? [];
  // xy-plot widgets are styled query objects
  const t = selection?.type;

  const [propertiesMaybe, setProperties] =
    selection?.useProperty(
      (properties) => properties,
      (_properties, updatedProperties) => updatedProperties
    ) ?? [];
  const defaultQuery: QueryProperties = {
    queryConfig: {
      source: 'iotsitewise',
      query: undefined,
    },
  };
  const properties = propertiesMaybe ? maybeWithDefault(defaultQuery, propertiesMaybe) ?? defaultQuery : defaultQuery;

  const setAssetModels = (updatedAssetModels: AssetModelQuery[] | undefined) => {
    if (!setProperties || !t || !isJust(t)) return;

    let updatedProperties = { ...properties };
    const compositeWidgetForAggregationInformation = {
      type: t.value,
      properties,
    } as QueryConfigWidget;
    // hangle styled widget
    if (t.value === 'xy-plot') {
      const styledQuery = styledQueryWidgetOnDrop(
        { assetModels: updatedAssetModels },
        compositeWidgetForAggregationInformation
      );
      updatedProperties = {
        ...properties,
        queryConfig: {
          ...properties.queryConfig,
          query: {
            ...properties.queryConfig.query,
            assetModels: (styledQuery as unknown as IoTSiteWiseDataStreamQuery).assetModels,
          },
        },
      };
    } else {
      const styledProperties = assignDefaultStyles({
        ...compositeWidgetForAggregationInformation,
        properties: {
          ...compositeWidgetForAggregationInformation.properties,
          queryConfig: {
            ...compositeWidgetForAggregationInformation.properties.queryConfig,
            query: {
              ...compositeWidgetForAggregationInformation.properties.queryConfig.query,
              assetModels: updatedAssetModels,
            },
          },
        },
      }).properties;
      updatedProperties = {
        ...styledProperties,
      };
    }

    setProperties(updatedProperties);
  };

  const definedAssetModels = properties.queryConfig.query?.assetModels ?? [];

  const onReset = useCallback(() => {
    const clearedModelBasedWidgets = widgets.map(({ properties, ...rest }) => ({
      ...rest,
      properties: {
        ...properties,
        queryConfig: {
          ...properties.queryConfig,
          query: {
            ...properties.queryConfig.query,
            assetModels: [],
          },
        },
      },
    }));

    update(clearedModelBasedWidgets);
  }, [update, widgets]);

  const onUpdateSelectedAsset = useCallback(
    (updatedSelectedAsset?: AssetSummary) => {
      if (updatedSelectedAsset && updatedSelectedAsset.id !== undefined) {
        const id = updatedSelectedAsset.id;
        const updatedSelectedAssets = widgets.map(({ properties, ...rest }) => ({
          ...rest,
          properties: {
            ...properties,
            queryConfig: {
              ...properties.queryConfig,
              query: {
                ...properties.queryConfig.query,
                assetModels: (properties.queryConfig.query?.assetModels ?? []).map((assetModel) => ({
                  ...assetModel,
                  assetIds: [id],
                })),
              },
            },
          },
        }));

        update(updatedSelectedAssets);
      }
    },
    [update, widgets]
  );

  const { assetModelId, assetIds } = getModelBasedQuery(dashboardConfiguration);

  return (
    <AssetModelDataStreamExplorerInternal
      client={client}
      assetModelsSelection={definedAssetModels}
      assetModelId={assetModelId}
      assetId={assetIds?.at(0)}
      setAssetModels={setAssetModels ?? noop}
      onUpdateSelectedAsset={onUpdateSelectedAsset}
      onResetModelBasedQueryWidgets={onReset}
      addEnabled={selection !== undefined}
    />
  );
};

export interface AssetModelDataStreamExplorerInternalProps {
  client: IoTSiteWiseClient;
  assetModelsSelection: SiteWiseAssetModelQuery['assetModels'];
  assetModelId?: string;
  assetId?: string;
  setAssetModels: (assetModels?: SiteWiseAssetModelQuery['assetModels']) => void;
  addEnabled?: boolean;
  onResetModelBasedQueryWidgets: () => void;
  onUpdateSelectedAsset: (assetSummary?: AssetSummary) => void;
}

export const AssetModelDataStreamExplorerInternal = ({
  client,
  assetModelsSelection,
  assetModelId,
  assetId,
  setAssetModels,
  addEnabled,
  onResetModelBasedQueryWidgets,
  onUpdateSelectedAsset,
}: AssetModelDataStreamExplorerInternalProps) => {
  const { propertyIds } = getAssetModelQueryInformation(assetModelsSelection);

  const [selectedAssetModel, selectAssetModel] = useSelectedAssetModel(createInitialAssetModelSummary(assetModelId));
  const [selectedAsset, selectAsset] = useSelectedAsset(createInitialAsset(assetId));
  const [selectedAssetModelProperties, selectAssetModelProperties] = useSelectedAssetModelProperties(
    createInitialAssetModelProperties(propertyIds)
  );

  useEffect(() => {
    onUpdateSelectedAsset(selectedAsset);
  }, [onUpdateSelectedAsset, selectedAsset]);

  const onReset = () => {
    selectAssetModel(undefined);
    selectAsset(undefined);
    selectAssetModelProperties([]);
    onResetModelBasedQueryWidgets();
  };

  const onSave = () => {
    if (selectedAssetModel?.id && selectedAssetModelProperties.length > 0) {
      setAssetModels(
        createAssetModelQuery({
          assetModelId: selectedAssetModel.id,
          assetId: selectedAsset?.id,
          assetModelPropertyIds: createNonNullableList(selectedAssetModelProperties.map(({ id }) => id)),
        })
      );
    }
  };

  return (
    <Box padding={{ horizontal: 's' }}>
      <AssetModelExplorer
        onResetSelectedAssetModel={onReset}
        client={client}
        selectedAssetModel={selectedAssetModel}
        setSelectedAssetModel={selectAssetModel}
        selectedAsset={selectedAsset}
        setSelectedAsset={selectAsset}
      />
      {selectedAssetModel && (
        <>
          <Box padding={{ bottom: 's', top: 'm' }}>
            <HorizontalDivider />
          </Box>
          <AssetModelPropertiesExplorer
            selectedAssetModelProperties={selectedAssetModelProperties}
            selectedAssetModel={selectedAssetModel}
            client={client}
            onSelect={(assetModelProperties) => selectAssetModelProperties(assetModelProperties)}
          />
          <Box padding={{ top: 's' }}>
            <HorizontalDivider />
          </Box>
          <AssetModelDataStreamSave onSave={onSave} disabled={!addEnabled} />
        </>
      )}
    </Box>
  );
};
