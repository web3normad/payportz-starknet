// lib/services/integratedPaymentService.ts
import YellowCardService from './yellowCardService';
import NiumService from './niumService';
import PayCrestService from './paycrestService';
import PaySlabContractService from './payslabContractService';
import { ApiResponse, TradeData, UserProfile } from '../../types';

interface PaymentFlow {
  step: 'onramp' | 'escrow' | 'payment' | 'delivery' | 'completed';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  timestamp: string;
}

interface TradePaymentData {
  tradeId: string;
  buyerDetails: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    walletAddress: string;
  };
  supplierDetails: {
    name: string;
    email: string;
    phone: string;
    country: string;
    currency: string; // Target currency for supplier
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
    };
  };
  tradeDetails: {
    product: string;
    amount: number; // in USD
    quantity: string;
    qualityStandards?: string;
    deliveryDeadline: Date;
    requiresInspection: boolean;
  };
}

class IntegratedPaymentService {
  private yellowCard: YellowCardService;
  private nium: NiumService;
  private payCrest: PayCrestService;
  private paySlabContract: PaySlabContractService;

  constructor() {
    this.yellowCard = new YellowCardService();
    this.nium = new NiumService();
    this.payCrest = new PayCrestService();
    this.paySlabContract = new PaySlabContractService();
  }

  // Step 1: Convert NGN to USDC (Onramp)
  async convertNGNToUSDC(
    ngnAmount: number,
    userDetails: {
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      walletAddress: string;
    }
  ): Promise<ApiResponse<{
    orderId: string;
    usdcAmount: number;
    paymentInstructions: any;
    status: string;
  }>> {
    try {
      console.log(`Step 1: Converting ₦${ngnAmount.toLocaleString()} to USDC...`);

      const result = await this.yellowCard.convertNGNToUSDC(
        ngnAmount,
        userDetails.walletAddress,
        {
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          phone: userDetails.phone,
        }
      );

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        data: {
          orderId: result.data.id,
          usdcAmount: result.data.cryptoAmount,
          paymentInstructions: result.data.paymentDetails,
          status: result.data.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Onramp conversion failed: ${(error as Error).message}`,
      };
    }
  }

  // Step 2: Create Smart Contract Trade with Escrow
  async createSmartTrade(
    tradeData: TradePaymentData
  ): Promise<ApiResponse<{
    tradeId: string;
    escrowContract: string;
    milestonePayments: any[];
    status: string;
  }>> {
    try {
      console.log(`Step 2: Creating smart contract trade for ${tradeData.tradeDetails.product}...`);

      // Initialize the smart contract service
      const initResult = await this.paySlabContract.initialize();
      if (!initResult.success) {
        return { success: false, error: 'Failed to initialize smart contract service' };
      }

      // Create the trade on smart contract
      const contractTradeData: TradeData = {
        sellerAddress: tradeData.supplierDetails.email, // This would be supplier's verified address
        amount: tradeData.tradeDetails.amount,
        deliveryDays: Math.ceil((tradeData.tradeDetails.deliveryDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        qualityStandards: tradeData.tradeDetails.qualityStandards || 'Standard commercial grade',
        requiresInspection: tradeData.tradeDetails.requiresInspection,
      };

      const tradeResult = await this.paySlabContract.createTrade(contractTradeData);
      if (!tradeResult.success) {
        return { success: false, error: 'Failed to create smart contract trade' };
      }

      // Define milestone payments (20% deposit, 30% shipping, 50% delivery)
      const milestones = [
        { percentage: 20, trigger: 'order_confirmation', amount: tradeData.tradeDetails.amount * 0.20 },
        { percentage: 30, trigger: 'shipment_started', amount: tradeData.tradeDetails.amount * 0.30 },
        { percentage: 50, trigger: 'delivery_confirmed', amount: tradeData.tradeDetails.amount * 0.50 },
      ];

      return {
        success: true,
        data: {
          tradeId: tradeResult.data.tradeId.toString(),
          escrowContract: 'Smart contract deployed',
          milestonePayments: milestones,
          status: 'escrow_created',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Smart trade creation failed: ${(error as Error).message}`,
      };
    }
  }

  // Step 3: Send Payment to Supplier in Their Local Currency
  async sendPaymentToSupplier(
    amount: number,
    supplierDetails: TradePaymentData['supplierDetails'],
    milestone: string = 'order_confirmation'
  ): Promise<ApiResponse<{
    transferId: string;
    localAmount: number;
    currency: string;
    status: string;
    estimatedArrival: string;
  }>> {
    try {
      console.log(`Step 3: Sending $${amount} to supplier in ${supplierDetails.currency}...`);

      // Use Nium to send money to supplier
      const transferResult = await this.nium.sendToSupplier(
        {
          name: supplierDetails.name,
          email: supplierDetails.email,
          phone: supplierDetails.phone,
          country: supplierDetails.country,
          accountNumber: supplierDetails.bankDetails.accountNumber,
          bankCode: supplierDetails.bankDetails.bankCode,
          bankName: supplierDetails.bankDetails.bankName,
          address: supplierDetails.address,
        },
        amount,
        supplierDetails.currency,
        'GOODS_TRADE',
        `PaySlab trade payment - ${milestone}`
      );

      if (!transferResult.success) {
        return transferResult;
      }

      return {
        success: true,
        data: {
          transferId: transferResult.data.transferId,
          localAmount: amount, // Would be converted amount in local currency
          currency: supplierDetails.currency,
          status: transferResult.data.status,
          estimatedArrival: transferResult.data.estimatedArrival,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Supplier payment failed: ${(error as Error).message}`,
      };
    }
  }

  // Complete trade flow - orchestrates all steps
  async executeCompleteTradeFlow(
    ngnAmount: number,
    tradeData: TradePaymentData
  ): Promise<ApiResponse<{
    onrampOrder: any;
    smartTrade: any;
    supplierPayment: any;
    flow: PaymentFlow[];
  }>> {
    const flow: PaymentFlow[] = [];
    
    try {
      // Step 1: NGN to USDC Conversion
      flow.push({
        step: 'onramp',
        status: 'processing',
        data: { ngnAmount },
        timestamp: new Date().toISOString(),
      });

      const onrampResult = await this.convertNGNToUSDC(ngnAmount, tradeData.buyerDetails);
      
      if (!onrampResult.success) {
        flow[0].status = 'failed';
        flow[0].data.error = onrampResult.error;
        return { success: false, error: onrampResult.error };
      }
      
      flow[0].status = 'completed';
      flow[0].data = { ...flow[0].data, ...onrampResult.data };

      // Step 2: Create Smart Contract Trade
      flow.push({
        step: 'escrow',
        status: 'processing',
        data: { tradeId: tradeData.tradeId },
        timestamp: new Date().toISOString(),
      });

      const smartTradeResult = await this.createSmartTrade(tradeData);
      
      if (!smartTradeResult.success) {
        flow[1].status = 'failed';
        flow[1].data.error = smartTradeResult.error;
        return { success: false, error: smartTradeResult.error };
      }
      
      flow[1].status = 'completed';
      flow[1].data = { ...flow[1].data, ...smartTradeResult.data };

      // Step 3: Send Initial Payment to Supplier (20% deposit)
      flow.push({
        step: 'payment',
        status: 'processing',
        data: { milestone: 'order_confirmation', percentage: 20 },
        timestamp: new Date().toISOString(),
      });

      const depositAmount = tradeData.tradeDetails.amount * 0.20;
      const paymentResult = await this.sendPaymentToSupplier(
        depositAmount,
        tradeData.supplierDetails,
        'order_confirmation'
      );
      
      if (!paymentResult.success) {
        flow[2].status = 'failed';
        flow[2].data.error = paymentResult.error;
        return { success: false, error: paymentResult.error };
      }
      
      flow[2].status = 'completed';
      flow[2].data = { ...flow[2].data, ...paymentResult.data };

      return {
        success: true,
        data: {
          onrampOrder: onrampResult.data,
          smartTrade: smartTradeResult.data,
          supplierPayment: paymentResult.data,
          flow,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Complete trade flow failed: ${(error as Error).message}`,
      };
    }
  }

  // Track payment status across all services
  async trackPaymentStatus(
    onrampOrderId: string,
    tradeId: string,
    transferId?: string
  ): Promise<ApiResponse<{
    onrampStatus: string;
    tradeStatus: string;
    paymentStatus?: string;
    overallStatus: string;
  }>> {
    try {
      // Check onramp status
      const onrampStatus = await this.yellowCard.getOrderStatus(onrampOrderId);
      
      // Check smart contract trade status
      const tradeStatus = await this.paySlabContract.getTrade(parseInt(tradeId));
      
      // Check payment transfer status if transferId provided
      let paymentStatus = null;
      if (transferId) {
        paymentStatus = await this.nium.getTransferStatus(transferId);
      }

      // Determine overall status
      let overallStatus = 'pending';
      if (onrampStatus.success && onrampStatus.data.status === 'completed' &&
          tradeStatus.success && paymentStatus?.success) {
        overallStatus = 'active';
      } else if (onrampStatus.data?.status === 'failed' || 
                 tradeStatus.data?.status === 'CANCELLED' ||
                 paymentStatus?.data?.status === 'FAILED') {
        overallStatus = 'failed';
      }

      return {
        success: true,
        data: {
          onrampStatus: onrampStatus.data?.status || 'unknown',
          tradeStatus: tradeStatus.data?.status || 'unknown',
          paymentStatus: paymentStatus?.data?.status || 'unknown',
          overallStatus,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to track payment status: ${(error as Error).message}`,
      };
    }
  }

  // Process milestone payments
  async processMilestonePayment(
    tradeId: string,
    milestone: 'shipment_started' | 'delivery_confirmed',
    supplierDetails: TradePaymentData['supplierDetails'],
    amount: number
  ): Promise<ApiResponse<any>> {
    try {
      console.log(`Processing milestone payment: ${milestone} for $${amount}`);

      const paymentResult = await this.sendPaymentToSupplier(
        amount,
        supplierDetails,
        milestone
      );

      if (!paymentResult.success) {
        return paymentResult;
      }

      // Update smart contract with milestone completion
      // This would trigger the next payment release
      console.log(`Milestone ${milestone} completed for trade ${tradeId}`);

      return {
        success: true,
        data: {
          milestone,
          paymentId: paymentResult.data.transferId,
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Milestone payment failed: ${(error as Error).message}`,
      };
    }
  }

  // Get conversion rates for user preview
  async getConversionPreview(
    ngnAmount: number
  ): Promise<ApiResponse<{
    ngnAmount: number;
    usdcAmount: number;
    exchangeRate: number;
    fees: number;
    totalCost: number;
  }>> {
    try {
      const rateResult = await this.yellowCard.getExchangeRate(ngnAmount, 'NGN', 'USDC');
      
      if (!rateResult.success) {
        return rateResult;
      }

      return {
        success: true,
        data: {
          ngnAmount,
          usdcAmount: rateResult.data.cryptoAmount,
          exchangeRate: rateResult.data.rate,
          fees: rateResult.data.fee,
          totalCost: rateResult.data.totalAmount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get conversion preview: ${(error as Error).message}`,
      };
    }
  }
}

export default IntegratedPaymentService;