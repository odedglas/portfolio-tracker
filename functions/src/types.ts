import { PortfoliosContext } from './utils/getPortfoliosContext';

export type PortfoliosSchedulerContext = PortfoliosContext & {
  dryRun: boolean;
};
