import {
  Holding,
  Portfolio,
  PortfolioHistory,
  Transaction,
  User,
} from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
  portfolioHistory: PortfolioHistory;
  users: User;
}

export type AppCollectionsNames = keyof AppCollections;
