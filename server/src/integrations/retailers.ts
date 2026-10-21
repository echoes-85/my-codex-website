export type FeedProduct = {
  externalId: string;
  brand: string;
  model: string;
  name: string;
  pricePence: number;
  currency: 'GBP';
  sourceUrl: string;
  availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
  delivery?: string;
  checkedAt: Date;
};

export interface RetailerFeedAdapter {
  readonly retailer: string;
  fetchProducts(): Promise<FeedProduct[]>;
}

export class JsonFeedAdapter implements RetailerFeedAdapter {
  constructor(public readonly retailer: string, private readonly feedUrl: string) {}
  async fetchProducts(): Promise<FeedProduct[]> {
    const response = await fetch(this.feedUrl, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`${this.retailer} feed returned ${response.status}`);
    const rows = await response.json() as unknown;
    if (!Array.isArray(rows)) throw new Error(`${this.retailer} feed must return an array`);
    return rows.map(row => ({ ...row as FeedProduct, currency: 'GBP', checkedAt: new Date() }));
  }
}

export function configuredAdapters(): RetailerFeedAdapter[] {
  const env = process.env;
  return [
    env.AMAZON_FEED_URL ? new JsonFeedAdapter('Amazon UK', env.AMAZON_FEED_URL) : null,
    env.CURRYS_FEED_URL ? new JsonFeedAdapter('Currys', env.CURRYS_FEED_URL) : null,
  ].filter((adapter): adapter is RetailerFeedAdapter => Boolean(adapter));
}

