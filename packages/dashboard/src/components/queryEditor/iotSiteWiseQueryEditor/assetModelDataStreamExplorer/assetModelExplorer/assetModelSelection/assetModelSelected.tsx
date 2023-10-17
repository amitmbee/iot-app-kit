import React, { useState } from 'react';

import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import Modal from '@cloudscape-design/components/modal';

import { VerticalDivider } from '~/components/divider/verticalDivider';
import { SelectedAssetModel } from '../../useSelectedAssetModel';
import CustomOrangeButton from '~/components/customOrangeButton';
import { AssetSummary, DescribeAssetCommandOutput, IoTSiteWiseClient } from '@aws-sdk/client-iotsitewise';
import { AssetForAssetModelSelect } from '../../assetsForAssetModelSelect/assetForAssetModelSelect';
import { SelectedAsset, UpdateSelectedAsset } from '../../useSelectedAsset';
import { useAssetModel } from '~/hooks/useAssetModel/useAssetModel';
import { useAsset } from '../../../modeledDataStreamQueryEditor/assetExplorer/useAsset';

const describedAssetToAssetSummary = (asset: DescribeAssetCommandOutput | undefined): AssetSummary | undefined =>
  asset
    ? {
        id: asset.assetId,
        arn: asset.assetArn,
        name: asset.assetName,
        assetModelId: asset.assetModelId,
        creationDate: asset.assetCreationDate,
        lastUpdateDate: asset.assetLastUpdateDate,
        status: asset.assetStatus,
        hierarchies: asset.assetHierarchies,
        description: asset.assetDescription,
      }
    : undefined;

type AssetModelSelectedOptions = {
  selectedAssetModel?: SelectedAssetModel;
  selectedAsset?: SelectedAsset;
  setSelectedAsset: UpdateSelectedAsset;
  onResetSelectedAssetModel?: () => void;
  client: IoTSiteWiseClient;
};

export const AssetModelSelected = ({
  selectedAssetModel,
  selectedAsset,
  setSelectedAsset,
  onResetSelectedAssetModel,
  client,
}: AssetModelSelectedOptions) => {
  const [modalVisible, setModalVisible] = useState(false);
  const onHideModal = () => setModalVisible(false);
  const onShowModal = () => setModalVisible(true);

  const { assetModel } = useAssetModel({ assetModelId: selectedAssetModel?.id, client });

  const { asset } = useAsset({ assetId: selectedAsset?.id, client });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Icon name='heart' />
        <VerticalDivider styles={{ alignSelf: 'stretch', height: 'initial' }} />
        <Box fontWeight='bold' variant='span'>
          Asset Model:
        </Box>
        <Box variant='span'>{assetModel?.assetModelName}</Box>
        <div style={{ flexGrow: 1, justifyContent: 'end', display: 'flex' }}>
          <Button onClick={onShowModal}>Reset</Button>
        </div>
      </div>
      <Box padding={{ top: 's' }}>
        <AssetForAssetModelSelect
          assetModelId={selectedAssetModel?.id}
          selectedAsset={describedAssetToAssetSummary(asset)}
          onSelectAsset={setSelectedAsset}
          client={client}
        />
      </Box>
      <Modal
        onDismiss={onHideModal}
        visible={modalVisible}
        footer={
          <Box float='right'>
            <SpaceBetween direction='horizontal' size='xs'>
              <Button onClick={onHideModal} variant='link'>
                Cancel
              </Button>
              <CustomOrangeButton title='Reset' handleClick={onResetSelectedAssetModel} />
            </SpaceBetween>
          </Box>
        }
        header='Reset asset model?'
      >
        <Alert
          statusIconAriaLabel='Warning'
          type='warning'
          header='Removing this asset model will remove associated parameters from widgets on this dashboard.'
        >
          This action cannot be undone. Once reset, you may associate this dashboard with a different asset model.
        </Alert>
      </Modal>
    </div>
  );
};
