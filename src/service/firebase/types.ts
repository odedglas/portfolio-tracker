import { Holding, Portfolio, Transaction } from 'app/shared/types';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
}

export type AppCollectionsNames = keyof AppCollections;
