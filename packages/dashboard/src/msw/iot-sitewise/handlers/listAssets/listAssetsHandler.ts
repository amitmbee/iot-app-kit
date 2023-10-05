import { type ListAssetsResponse } from '@aws-sdk/client-iotsitewise';
import { rest } from 'msw';

import { LIST_ASSETS_URL } from './constants';
import { ASSET_HIERARCHY } from '../../resources/assets';
import { summarizeAssetDescription } from '../../resources/assets/summarizeAssetDescription';

export function listAssetsHandler() {
  return rest.get(LIST_ASSETS_URL, (_req, res, ctx) => {
    const rootAssets = ASSET_HIERARCHY.getRootAssets();
    const rootAssetSummaries = rootAssets.map(summarizeAssetDescription);

    const response: ListAssetsResponse = {
      assetSummaries: rootAssetSummaries,
      nextToken: undefined,
    };

    return res(ctx.delay(), ctx.status(200), ctx.json(response));
  });
}
