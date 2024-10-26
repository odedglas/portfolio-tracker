import {
  Holding,
  Portfolio,
  PortfolioHistory,
  Transaction,
  User,
  Notification,
} from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
  portfolioHistory: PortfolioHistory;
  users: User;
  notifications: Notification;
}

export type AppCollectionsNames = keyof AppCollections;
