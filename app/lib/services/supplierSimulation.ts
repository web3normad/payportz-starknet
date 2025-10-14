// lib/services/supplierSimulation.ts
import { ApiResponse } from '../../types';

interface SupplierProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  bankDetails: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    swiftCode?: string;
  };
  address: {
    line1: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
  };
  products: Array<{
    id: string;
    name: string;
    category: string;
    minOrderQuantity: number;
    pricePerUnit: number;
    currency: string;
    leadTimeDays: number;
    qualityStandards: string[];
  }>;
  paymentPreferences: {
    acceptsCrypto: boolean;
    preferredCurrencies: string[];
    paymentTerms: string;
    requiresEscrow: boolean;
  };
  ratings: {
    overall: number;
    onTimeDelivery: number;
    productQuality: number;
    communication: number;
    totalTrades: number;
  };
}

interface TradeNotification {
  id: string;
  type: 'new_order' | 'payment_received' | 'milestone_payment' | 'dispute' | 'review_request';
  tradeId: string;
  buyerName: string;
  amount: number;
  currency: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface SupplierPaymentStatus {
  tradeId: string;
  totalAmount: number;
  currency: string;
  payments: Array<{
    milestone: string;
    amount: number;
    status: 'pending' | 'sent' | 'received' | 'failed';
    date?: string;
    transactionId?: string;
  }>;
  balance: number;
}

class SupplierSimulation {
  private mockSuppliers: SupplierProfile[] = [
    {
      id: 'SUP-001',
      name: 'Shanghai Electronics Co.',
      email: 'orders@shanghai-electronics.com',
      phone: '+86-21-5555-0123',
      country: 'CN',
      currency: 'CNY',
      bankDetails: {
        accountNumber: '6228480402564890000',
        bankCode: 'ICBCCNBJ',
        bankName: 'Industrial and Commercial Bank of China',
        swiftCode: 'ICBKCNBJ',
      },
      address: {
        line1: '1500 Nanjing Road East',
        city: 'Shanghai',
        state: 'Shanghai',
        zipCode: '200001',
        country: 'CN',
      },
      products: [
        {
          id: 'PROD-001',
          name: 'Smartphone Components',
          category: 'Electronics',
          minOrderQuantity: 100,
          pricePerUnit: 125,
          currency: 'USD',
          leadTimeDays: 15,
          qualityStandards: ['CE Certified', 'RoHS Compliant', 'ISO 9001'],
        },
        {
          id: 'PROD-002',
          name: 'LED Display Modules',
          category: 'Electronics',
          minOrderQuantity: 50,
          pricePerUnit: 89,
          currency: 'USD',
          leadTimeDays: 10,
          qualityStandards: ['FCC Approved', 'Energy Star'],
        },
      ],
      paymentPreferences: {
        acceptsCrypto: true,
        preferredCurrencies: ['USD', 'CNY', 'USDC'],
        paymentTerms: '30% deposit, 70% on delivery',
        requiresEscrow: true,
      },
      ratings: {
        overall: 4.8,
        onTimeDelivery: 4.9,
        productQuality: 4.7,
        communication: 4.8,
        totalTrades: 156,
      },
    },
    {
      id: 'SUP-002',
      name: 'Dubai Textile Mills',
      email: 'export@dubai-textiles.ae',
      phone: '+971-4-555-7890',
      country: 'AE',
      currency: 'AED',
      bankDetails: {
        accountNumber: '0123456789012345',
        bankCode: 'EBILAEAD',
        bankName: 'Emirates Islamic Bank',
        swiftCode: 'EBILAEAD',
      },
      address: {
        line1: 'Dubai Textile City, Block A',
        city: 'Dubai',
        state: 'Dubai',
        zipCode: '00000',
        country: 'AE',
      },
      products: [
        {
          id: 'PROD-003',
          name: 'Cotton Fabric',
          category: 'Textiles',
          minOrderQuantity: 500,
          pricePerUnit: 15.50,
          currency: 'USD',
          leadTimeDays: 12,
          qualityStandards: ['GOTS Certified', 'Oeko-Tex Standard 100'],
        },
        {
          id: 'PROD-004',
          name: 'Polyester Blend',
          category: 'Textiles',
          minOrderQuantity: 300,
          pricePerUnit: 12.75,
          currency: 'USD',
          leadTimeDays: 8,
          qualityStandards: ['ISO 14001', 'WRAP Certified'],
        },
      ],
      paymentPreferences: {
        acceptsCrypto: true,
        preferredCurrencies: ['USD', 'AED', 'USDT'],
        paymentTerms: '20% deposit, 30% on shipment, 50% on delivery',
        requiresEscrow: true,
      },
      ratings: {
        overall: 4.6,
        onTimeDelivery: 4.5,
        productQuality: 4.8,
        communication: 4.7,
        totalTrades: 89,
      },
    },
    {
      id: 'SUP-003',
      name: 'German Machinery Ltd',
      email: 'sales@german-machinery.de',
      phone: '+49-89-555-1234',
      country: 'DE',
      currency: 'EUR',
      bankDetails: {
        accountNumber: 'DE89370400440532013000',
        bankCode: 'COBADEFF',
        bankName: 'Commerzbank AG',
        swiftCode: 'COBADEFFXXX',
      },
      address: {
        line1: 'Industriestraße 42',
        city: 'Munich',
        state: 'Bavaria',
        zipCode: '80339',
        country: 'DE',
      },
      products: [
        {
          id: 'PROD-005',
          name: 'Industrial Equipment',
          category: 'Machinery',
          minOrderQuantity: 1,
          pricePerUnit: 25000,
          currency: 'USD',
          leadTimeDays: 45,
          qualityStandards: ['CE Marking', 'TÜV Certified', 'ISO 13485'],
        },
        {
          id: 'PROD-006',
          name: 'Precision Tools',
          category: 'Machinery',
          minOrderQuantity: 10,
          pricePerUnit: 890,
          currency: 'USD',
          leadTimeDays: 20,
          qualityStandards: ['DIN Standards', 'VDE Approved'],
        },
      ],
      paymentPreferences: {
        acceptsCrypto: false,
        preferredCurrencies: ['EUR', 'USD'],
        paymentTerms: '50% deposit, 50% before shipment',
        requiresEscrow: false,
      },
      ratings: {
        overall: 4.9,
        onTimeDelivery: 4.8,
        productQuality: 5.0,
        communication: 4.9,
        totalTrades: 234,
      },
    },
  ];

  private notifications: Map<string, TradeNotification[]> = new Map();
  private paymentStatuses: Map<string, SupplierPaymentStatus> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize some mock notifications and payment statuses
    this.notifications.set('SUP-001', [
      {
        id: 'NOTIF-001',
        type: 'payment_received',
        tradeId: 'TRD-001',
        buyerName: 'PaySlab User',
        amount: 2500,
        currency: 'USD',
        message: 'Deposit payment received for smartphone components order',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
      },
    ]);

    this.paymentStatuses.set('TRD-001', {
      tradeId: 'TRD-001',
      totalAmount: 12500,
      currency: 'USD',
      payments: [
        {
          milestone: 'order_confirmation',
          amount: 2500,
          status: 'received',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          transactionId: 'TX-001',
        },
        {
          milestone: 'shipment_started',
          amount: 3750,
          status: 'pending',
        },
        {
          milestone: 'delivery_confirmed',
          amount: 6250,
          status: 'pending',
        },
      ],
      balance: 2500,
    });
  }

  // Get all suppliers
  async getAllSuppliers(): Promise<ApiResponse<SupplierProfile[]>> {
    try {
      return { success: true, data: this.mockSuppliers };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get suppliers: ${(error as Error).message}`,
      };
    }
  }

  // Get supplier by ID
  async getSupplierById(supplierId: string): Promise<ApiResponse<SupplierProfile>> {
    try {
      const supplier = this.mockSuppliers.find(s => s.id === supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }
      return { success: true, data: supplier };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get supplier: ${(error as Error).message}`,
      };
    }
  }

  // Search suppliers by country/currency
  async searchSuppliers(
    query: {
      country?: string;
      currency?: string;
      category?: string;
      acceptsCrypto?: boolean;
    }
  ): Promise<ApiResponse<SupplierProfile[]>> {
    try {
      let filtered = this.mockSuppliers;

      if (query.country) {
        filtered = filtered.filter(s => s.country === query.country);
      }
      if (query.currency) {
        filtered = filtered.filter(s => s.currency === query.currency);
      }
      if (query.category) {
        filtered = filtered.filter(s => 
          s.products.some(p => p.category.toLowerCase().includes(query.category!.toLowerCase()))
        );
      }
      if (query.acceptsCrypto !== undefined) {
        filtered = filtered.filter(s => s.paymentPreferences.acceptsCrypto === query.acceptsCrypto);
      }

      return { success: true, data: filtered };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search suppliers: ${(error as Error).message}`,
      };
    }
  }

  // Simulate receiving a payment
  async simulatePaymentReceived(
    supplierId: string,
    tradeId: string,
    milestone: string,
    amount: number,
    currency: string = 'USD'
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      // Update payment status
      let paymentStatus = this.paymentStatuses.get(tradeId);
      if (!paymentStatus) {
        paymentStatus = {
          tradeId,
          totalAmount: amount * 4, // Assume this is 25% of total
          currency,
          payments: [],
          balance: 0,
        };
      }

      // Find and update the payment
      const payment = paymentStatus.payments.find(p => p.milestone === milestone);
      if (payment) {
        payment.status = 'received';
        payment.date = new Date().toISOString();
        payment.transactionId = `TX-${Date.now()}`;
        paymentStatus.balance += payment.amount;
      }

      this.paymentStatuses.set(tradeId, paymentStatus);

      // Add notification
      const supplier = this.mockSuppliers.find(s => s.id === supplierId);
      if (supplier) {
        const notifications = this.notifications.get(supplierId) || [];
        notifications.unshift({
          id: `NOTIF-${Date.now()}`,
          type: 'payment_received',
          tradeId,
          buyerName: 'PaySlab User',
          amount,
          currency,
          message: `Payment received for ${milestone}: ${currency} ${amount.toLocaleString()}`,
          timestamp: new Date().toISOString(),
          read: false,
        });
        this.notifications.set(supplierId, notifications);
      }

      return {
        success: true,
        data: {
          success: true,
          message: `Payment of ${currency} ${amount} received for ${milestone}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to simulate payment: ${(error as Error).message}`,
      };
    }
  }

  // Get supplier notifications
  async getSupplierNotifications(supplierId: string): Promise<ApiResponse<TradeNotification[]>> {
    try {
      const notifications = this.notifications.get(supplierId) || [];
      return { success: true, data: notifications };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get notifications: ${(error as Error).message}`,
      };
    }
  }

  // Get payment status for a trade
  async getPaymentStatus(tradeId: string): Promise<ApiResponse<SupplierPaymentStatus>> {
    try {
      const paymentStatus = this.paymentStatuses.get(tradeId);
      if (!paymentStatus) {
        throw new Error('Payment status not found');
      }
      return { success: true, data: paymentStatus };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get payment status: ${(error as Error).message}`,
      };
    }
  }

  // Simulate supplier actions
  async simulateSupplierAction(
    supplierId: string,
    tradeId: string,
    action: 'confirm_order' | 'start_production' | 'ship_order' | 'confirm_delivery'
  ): Promise<ApiResponse<{ action: string; message: string; timestamp: string }>> {
    try {
      const supplier = this.mockSuppliers.find(s => s.id === supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      let message = '';
      switch (action) {
        case 'confirm_order':
          message = `Order confirmed by ${supplier.name}. Production will begin shortly.`;
          break;
        case 'start_production':
          message = `Production started by ${supplier.name}. Estimated completion in 10-15 days.`;
          break;
        case 'ship_order':
          message = `Order shipped by ${supplier.name}. Tracking number: DHL${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          break;
        case 'confirm_delivery':
          message = `Delivery confirmed by ${supplier.name}. Trade completed successfully.`;
          break;
      }

      // Add notification to buyer (this would normally go to the buyer)
      console.log(`Supplier Action: ${action} - ${message}`);

      return {
        success: true,
        data: {
          action,
          message,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to simulate supplier action: ${(error as Error).message}`,
      };
    }
  }

  // Create a new trade order
  async createTradeOrder(
    supplierId: string,
    productId: string,
    quantity: number,
    buyerDetails: {
      name: string;
      email: string;
      company?: string;
    }
  ): Promise<ApiResponse<{
    tradeId: string;
    supplier: SupplierProfile;
    product: any;
    totalAmount: number;
    paymentSchedule: any[];
  }>> {
    try {
      const supplier = this.mockSuppliers.find(s => s.id === supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const product = supplier.products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (quantity < product.minOrderQuantity) {
        throw new Error(`Minimum order quantity is ${product.minOrderQuantity}`);
      }

      const tradeId = `TRD-${Date.now()}`;
      const totalAmount = product.pricePerUnit * quantity;

      // Create payment schedule based on supplier preferences
      const paymentSchedule = [
        { milestone: 'order_confirmation', percentage: 20, amount: totalAmount * 0.20 },
        { milestone: 'shipment_started', percentage: 30, amount: totalAmount * 0.30 },
        { milestone: 'delivery_confirmed', percentage: 50, amount: totalAmount * 0.50 },
      ];

      // Initialize payment status
      this.paymentStatuses.set(tradeId, {
        tradeId,
        totalAmount,
        currency: product.currency,
        payments: paymentSchedule.map(p => ({
          milestone: p.milestone,
          amount: p.amount,
          status: 'pending' as const,
        })),
        balance: 0,
      });

      // Add notification to supplier
      const notifications = this.notifications.get(supplierId) || [];
      notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        type: 'new_order',
        tradeId,
        buyerName: buyerDetails.name,
        amount: totalAmount,
        currency: product.currency,
        message: `New order received: ${quantity} units of ${product.name}`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      this.notifications.set(supplierId, notifications);

      return {
        success: true,
        data: {
          tradeId,
          supplier,
          product,
          totalAmount,
          paymentSchedule,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create trade order: ${(error as Error).message}`,
      };
    }
  }

  // Get supplier dashboard data
  async getSupplierDashboard(supplierId: string): Promise<ApiResponse<{
    supplier: SupplierProfile;
    activeOrders: number;
    totalEarnings: number;
    pendingPayments: number;
    recentNotifications: TradeNotification[];
  }>> {
    try {
      const supplier = this.mockSuppliers.find(s => s.id === supplierId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      const notifications = this.notifications.get(supplierId) || [];
      const recentNotifications = notifications.slice(0, 5);

      // Mock dashboard data
      const dashboardData = {
        supplier,
        activeOrders: 3,
        totalEarnings: 45650,
        pendingPayments: 12500,
        recentNotifications,
      };

      return { success: true, data: dashboardData };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get supplier dashboard: ${(error as Error).message}`,
      };
    }
  }
}

export default SupplierSimulation;