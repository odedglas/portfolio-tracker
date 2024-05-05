import { Portfolio } from 'src/types';

export interface AppCollections {
  portfolios: Portfolio;
}

export type AppCollectionsNames = keyof AppCollections;

export type { Portfolio };
