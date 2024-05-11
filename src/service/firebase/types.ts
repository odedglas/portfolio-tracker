import { Portfolio, Transaction } from 'src/types';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
}

export type AppCollectionsNames = keyof AppCollections;
