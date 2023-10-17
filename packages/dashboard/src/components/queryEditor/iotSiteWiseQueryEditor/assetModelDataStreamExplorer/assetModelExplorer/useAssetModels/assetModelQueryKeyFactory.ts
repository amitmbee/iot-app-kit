export class AssetModelsCacheKeyFactory {
  create() {
    const cacheKey = [{ resource: 'asset models' }] as const;

    return cacheKey;
  }
}
