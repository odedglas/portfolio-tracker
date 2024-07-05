import { Holding, Portfolio, PortfolioHistory, Transaction } from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
  portfolioHistory: PortfolioHistory;
}

export type AppCollectionsNames = keyof AppCollections;
