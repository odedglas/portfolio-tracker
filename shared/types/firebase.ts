import {
  Holding,
  Portfolio,
  PortfolioHistory,
  Transaction,
  User,
  Notification,
  Alert,
  PortfolioInsight,
} from './entities';

export interface AppCollections {
  portfolios: Portfolio;
  transactions: Transaction;
  holdings: Holding;
  portfolioHistory: PortfolioHistory;
  users: User;
  notifications: Notification;
  alerts: Alert;
  insights: PortfolioInsight;
}

export type AppCollectionsNames = keyof AppCollections;
