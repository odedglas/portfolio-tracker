import { Holding, Portfolio, Transaction } from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
}

export type AppCollectionsNames = keyof AppCollections;
