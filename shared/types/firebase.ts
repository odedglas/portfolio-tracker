import {
  Holding,
  Portfolio,
  PortfolioHistory,
  Transaction,
  User,
  Notification,
  Alert,
} from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
  portfolioHistory: PortfolioHistory;
  users: User;
  notifications: Notification;
  alerts: Alert;
}

export type AppCollectionsNames = keyof AppCollections;
