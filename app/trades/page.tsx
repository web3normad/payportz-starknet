'use client';
import React, { useState, useMemo } from "react";
import Layout from "../components/core/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { 
  MagnifyingGlass,
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  Warning,
  X,
  DownloadSimple,
  FileText,
  CurrencyDollar,
  Calendar,
  MapPin,
  Eye,
  Package,
  Users,
  Plus,
  TrendUp
} from "@phosphor-icons/react";

// Import hooks
import { 
  useTrades, 
  useTradeStats, 
  useCreateTrade, 
  useProcessMilestonePayment,
  useTradeDocuments,
  useSuppliers,
  useShippingTracking,
  Trade
} from "../hooks/useTrades";

// Create Trade Modal Component
const CreateTradeModal = ({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('FOB');
  const [qualityRequirements, setQualityRequirements] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');

  const { data: suppliers = [] } = useSuppliers();
  const { mutate: createTrade, isPending: isCreating } = useCreateTrade();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSupplier || !productName || !quantity || !amount) return;

    createTrade({
      supplierId: selectedSupplier,
      productName,
      quantity,
      amount: parseFloat(amount),
      destination,
      deliveryTerms,
      qualityRequirements,
      expectedDelivery: new Date(expectedDelivery)
    }, {
      onSuccess: () => {
        onClose();
        setProductName('');
        setQuantity('');
        setAmount('');
        setDestination('');
        setSelectedSupplier('');
        setExpectedDelivery('');
        setQualityRequirements('');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Trade</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.country})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Smartphone Components"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100 units"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="12500"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Lagos, Nigeria"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Terms</label>
              <select
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FOB">FOB (Free on Board)</option>
                <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                <option value="CFR">CFR (Cost and Freight)</option>
                <option value="EXW">EXW (Ex Works)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Requirements</label>
            <textarea
              value={qualityRequirements}
              onChange={(e) => setQualityRequirements(e.target.value)}
              placeholder="Specify quality standards and requirements..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" type="button">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Creating Trade...' : 'Create Trade'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Trade Modal Component
const TradeModal = ({ isOpen, onClose, trade, onDownloadPDF }: {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onDownloadPDF: (tradeId: string, docType: string) => void;
}) => {
  const { data: documents = [] } = useTradeDocuments(trade?.id || '');
  const { data: shippingData } = useShippingTracking(trade?.trackingNumber || '');
  const { mutate: processMilestone } = useProcessMilestonePayment();

  if (!isOpen || !trade) return null;

  const statusColors = {
    'In Transit': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Truck },
    'Delivered': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'Processing': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    'Pending Payment': { bg: 'bg-purple-100', text: 'text-purple-800', icon: CurrencyDollar },
    'Disputed': { bg: 'bg-red-100', text: 'text-red-800', icon: Warning }
  };

  const statusConfig = statusColors[trade.status];
  const StatusIcon = statusConfig.icon;

  const handleMilestonePayment = (milestoneId: string, amount: number) => {
    processMilestone({
      tradeId: trade.id,
      milestoneId,
      supplierId: 'SUP-001',
      amount
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trade #{trade.id}</h2>
            <p className="text-gray-600">{trade.supplier}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg}`}>
              <StatusIcon size={16} className={statusConfig.text} />
              <span className={`text-sm font-medium ${statusConfig.text}`}>{trade.status}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Package size={20} className="text-[#444444]" />
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium">{trade.product}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CurrencyDollar size={20} className="text-[#444444]" />
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-medium">{trade.amount}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-[#444444]" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium">{trade.destination}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={20} className="text-[#444444]" />
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="font-medium">{trade.expectedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-[#444444] h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${trade.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{trade.progress}% Complete</p>
            </div>

            {trade.paymentMilestones && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Milestones</h3>
                <div className="space-y-3">
                  {trade.paymentMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                          milestone.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {milestone.status === 'completed' ? <CheckCircle size={16} /> :
                           milestone.status === 'failed' ? <X size={16} /> :
                           <Clock size={16} />}
                        </div>
                        <div>
                          <p className="font-medium">{milestone.description}</p>
                          <p className="text-sm text-gray-600">${milestone.amount.toLocaleString()} ({milestone.percentage}%)</p>
                        </div>
                      </div>
                      {milestone.status === 'pending' && (
                        <Button size="small" onClick={() => handleMilestonePayment(milestone.id, milestone.amount)}>
                          Pay Now
                        </Button>
                      )}
                      {milestone.status === 'completed' && milestone.transactionHash && (
                        <button
                          onClick={() => window.open(`https://starkscan.co/tx/${milestone.transactionHash}`, '_blank')}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View TX
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trade.trackingNumber && shippingData && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Status</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-mono font-medium">{trade.trackingNumber}</p>
                    </div>
                    <Button variant="outline" size="small">
                      <Eye size={16} className="mr-1" />
                      Track Package
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {shippingData.events.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="text-xs text-gray-500">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Documents</h3>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FileText size={20} className="text-[#444444]" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button onClick={() => onDownloadPDF(trade.id, doc.type)} variant="outline" size="small">
                      <DownloadSimple size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start">
                  <Users size={16} className="mr-2" />
                  Contact Supplier
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Warning size={16} className="mr-2" />
                  Report Issue
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DownloadSimple size={16} className="mr-2" />
                  Export Trade Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ options, onApplyFilters }: {
  options: any[];
  onApplyFilters: (filters: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const applyFilters = () => {
    onApplyFilters(selectedFilters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button variant="outline" size="small" onClick={() => setIsOpen(!isOpen)}>
        Filter ({selectedFilters.length})
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(option.id)}
                  onChange={() => handleFilterToggle(option.id)}
                  className="rounded border-gray-300 text-[#444444] focus:ring-[#444444]"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex space-x-2 mt-4">
            <Button size="small" onClick={applyFilters} className="flex-1">
              Apply
            </Button>
            <Button variant="outline" size="small" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Trade Card Component
const TradeCard = ({ title, value, highlight, isLoading = false, icon: Icon }: {
  title: string;
  value: string | number;
  highlight?: string;
  isLoading?: boolean;
  icon?: any;
}) => {
  const IconComponent = Icon || ShoppingBag;
  
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
          {highlight && (
            <p className="text-sm text-[#444444] font-medium mt-1">{highlight}</p>
          )}
        </div>
        <div className="p-3 bg-[#444444] bg-opacity-10 rounded-xl">
          <IconComponent size={24} className="text-[#444444]" />
        </div>
      </div>
    </Card>
  );
};

export default function MyTrades() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const { data: trades = [], isLoading: tradesLoading } = useTrades();
  const { data: tradeStats, isLoading: statsLoading } = useTradeStats();

  const filterOptions = [
    { id: 'status', label: 'Trade Status' },
    { id: 'amount', label: 'Amount Range' },
    { id: 'date', label: 'Date Range' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'destination', label: 'Destination' }
  ];

  const filteredTrades = useMemo(() => {
    let filtered = trades;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.id.toLowerCase().includes(query) ||
        trade.supplier.toLowerCase().includes(query) ||
        trade.product.toLowerCase().includes(query) ||
        trade.destination.toLowerCase().includes(query)
      );
    }

    switch (selectedTab) {
      case 'active':
        filtered = filtered.filter(trade => 
          ['In Transit', 'Processing', 'Pending Payment'].includes(trade.status)
        );
        break;
      case 'completed':
        filtered = filtered.filter(trade => trade.status === 'Delivered');
        break;
      case 'disputed':
        filtered = filtered.filter(trade => trade.status === 'Disputed');
        break;
    }

    return filtered;
  }, [trades, searchQuery, selectedTab]);

  const handleApplyFilters = (selectedFilters: string[]) => {
    setActiveFilters(selectedFilters);
  };

  const handleRowClick = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTradeId('');
  };

  const handleDownloadPDF = (tradeId: string, docType: string) => {
    console.log(`Downloading ${docType} for trade ${tradeId}`);
  };

  const selectedTrade = selectedTradeId 
    ? trades.find(trade => trade.id === selectedTradeId) || null
    : null;

  const getStatusConfig = (status: Trade['status']) => {
    const configs = {
      'In Transit': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'Processing': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'Pending Payment': { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
      'Disputed': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
    };
    return configs[status];
  };

  return (
    <Layout>
      <div className="p-6 w-full">
        <div className="w-full max-w-8xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Trades</h1>
              <p className="text-gray-600 mt-1">Manage and track your international trade transactions</p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus size={20} className="mr-2" />
              Create Trade
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <TradeCard 
              title="Total Trades"
              value={tradeStats?.totalTrades || 0}
              highlight={`$${tradeStats?.totalValue.toLocaleString() || 0} total value`}
              isLoading={statsLoading}
              icon={ShoppingBag}
            />
            <TradeCard 
              title="Active Trades"
              value={tradeStats?.activeTrades || 0}
              highlight={`${tradeStats?.completedTrades || 0} completed`}
              isLoading={statsLoading}
              icon={Truck}
            />
            <TradeCard 
              title="Success Rate"
              value={`${tradeStats?.successRate.toFixed(1) || 0}%`}
              highlight="Last 30 days"
              isLoading={statsLoading}
              icon={TrendUp}
            />
            <TradeCard 
              title="Avg. Trade Value"
              value={`$${tradeStats?.averageValue.toLocaleString() || 0}`}
              highlight="Per transaction"
              isLoading={statsLoading}
              icon={CurrencyDollar}
            />
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlass size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-[300px] pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#444444] focus:bg-white"
                  placeholder="Search trades..."
                />
              </div>

              <FilterDropdown 
                options={filterOptions}
                onApplyFilters={handleApplyFilters}
              />
            </div>
            
            <div className="flex space-x-1">
              {[
                { id: 'all', label: 'All Trades' },
                { id: 'active', label: 'Active' },
                { id: 'completed', label: 'Completed' },
                { id: 'disputed', label: 'Disputed' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-[#444444] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map(filterId => {
                const option = filterOptions.find(opt => opt.id === filterId);
                return option ? (
                  <div 
                    key={filterId}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm"
                  >
                    {option.label}
                    <button 
                      onClick={() => setActiveFilters(prev => prev.filter(id => id !== filterId))}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null;
              })}
              <button 
                onClick={() => setActiveFilters([])}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          )}

          <Card className="overflow-hidden">
            {tradesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#444444] mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading trades...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          Trade ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          Supplier
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          Product
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <CurrencyDollar size={16} />
                          Amount
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          Destination
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Expected
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTrades.map((trade) => {
                      const statusConfig = getStatusConfig(trade.status);
                      return (
                        <tr 
                          key={trade.id}
                          onClick={() => handleRowClick(trade.id)}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{trade.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.supplier}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.product}</div>
                            <div className="text-sm text-gray-500">{trade.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{trade.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trade.destination}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              <span className={`w-2 h-2 rounded-full mr-1.5 ${statusConfig.dot}`}></span>
                              {trade.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trade.expectedDelivery}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-[#444444] h-2 rounded-full" 
                                  style={{ width: `${trade.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 min-w-[3rem]">{trade.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredTrades.length === 0 && !tradesLoading && (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No trades found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery ? `No trades match "${searchQuery}"` : `No ${selectedTab} trades found`}
                    </p>
                    {!searchQuery && selectedTab === 'all' && (
                      <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Your First Trade
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {filteredTrades.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTrades.length}</span> of{' '}
                <span className="font-medium">{trades.length}</span> trades
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="small" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="small" disabled>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TradeModal
        isOpen={modalOpen}
        onClose={closeModal}
        trade={selectedTrade}
        onDownloadPDF={handleDownloadPDF}
      />

      <CreateTradeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </Layout>
  );
}