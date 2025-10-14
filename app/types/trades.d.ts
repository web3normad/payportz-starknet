export interface Trade {
  id: string;
  route: string;
  amount: string;
  trader: string;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Disputed';
  created: string;
  progress: number;
  description?: string;
  txHash?: string;
  walletAddress?: string;
  exchangeRate?: string;
  fees?: string;
  fromCurrency: string;
  toCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  escrowAmount?: string;
  releaseConditions?: string[];
  milestones?: TradeMilestone[];
}

export interface TradeMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completedAt?: Date;
  requiredDocuments?: string[];
  verificationRequired: boolean;
}

export interface TradeFilter {
  status?: Trade['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  currency?: string[];
  trader?: string;
}

export interface CreateTradeRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  trader: string;
  exchangeRate: string;
  description?: string;
}

export interface UpdateTradeRequest {
  status?: Trade['status'];
  progress?: number;
  description?: string;
  exchangeRate?: string;
}