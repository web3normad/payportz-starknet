"use client";
import React, { useState } from 'react';
import Layout from '../components/core/Layout';
import { 
  TrendUp, 
  TrendDown,
  ChartLine,
  Calendar,
  Users,
  Package,
  CurrencyDollar,
  Target,
  Percent,
  Download
} from '@phosphor-icons/react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  const analytics = {
    totalVolume: 47500000, // ₦47.5M
    totalTrades: 24,
    avgTradeValue: 1979166, // ₦1.98M
    profitMargin: 23.5,
    topSuppliers: [
      { name: 'Shanghai Electronics Co.', spent: 12500000, trades: 8, margin: 28.5 },
      { name: 'Dubai Textile Mills', spent: 8200000, trades: 5, margin: 18.2 },
      { name: 'German Machinery Ltd', spent: 15000000, trades: 4, margin: 31.2 }
    ],
    categoryBreakdown: [
      { category: 'Electronics', amount: 18500000, percentage: 39, trades: 12 },
      { category: 'Textiles', amount: 12000000, percentage: 25, trades: 7 },
      { category: 'Machinery', amount: 17000000, percentage: 36, trades: 5 }
    ],
    monthlyTrends: [
      { month: 'Jul', volume: 8500000, trades: 6, margin: 21.5 },
      { month: 'Aug', volume: 12200000, trades: 9, margin: 24.8 },
      { month: 'Sep', volume: 15800000, trades: 11, margin: 22.3 },
      { month: 'Oct', volume: 11000000, trades: 8, margin: 25.1 }
    ],
    seasonalInsights: [
      { season: 'Q3 2024', pattern: 'Peak buying season', impact: '+45% volume' },
      { season: 'Electronics', pattern: 'Best margins in Aug-Sep', impact: '+8% margin' }
    ]
  };

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="p-2 bg-gray-100 rounded-xl">
          <Icon size={20} className="text-[#444444]" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${
            change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change > 0 ? <TrendUp size={16} /> : <TrendDown size={16} />}
            <span>{Math.abs(change)}% vs last period</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600 mt-1">Track performance and identify growth opportunities</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="px-4 py-2 bg-[#444444] text-white rounded-xl hover:bg-[#333333] flex items-center space-x-2">
              <Download size={16} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Trade Volume"
            value={analytics.totalVolume}
            change={32.5}
            icon={CurrencyDollar}
            prefix="₦"
          />
          <StatCard
            title="Number of Trades"
            value={analytics.totalTrades}
            change={18.2}
            icon={Package}
          />
          <StatCard
            title="Avg Trade Value"
            value={analytics.avgTradeValue}
            change={8.7}
            icon={Target}
            prefix="₦"
          />
          <StatCard
            title="Profit Margin"
            value={analytics.profitMargin}
            change={5.3}
            icon={Percent}
            suffix="%"
          />
        </div>

        {/* Monthly Trends Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance Trends</h3>
            <div className="flex space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-[#444444] rounded-full"></div>
                <span className="text-gray-600">Volume</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Margin</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {analytics.monthlyTrends.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{data.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">₦{(data.volume / 1000000).toFixed(1)}M</span>
                    <span className="text-green-600">{data.margin}%</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#444444] h-full rounded-full"
                      style={{ width: `${(data.volume / 20000000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${(data.margin / 35) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Suppliers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Suppliers by Volume</h3>
              <Users size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics.topSuppliers.map((supplier, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#444444] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-500">{supplier.trades} trades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{(supplier.spent / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-green-600">{supplier.margin}% margin</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#444444] h-full rounded-full"
                      style={{ width: `${(supplier.spent / 15000000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
              <ChartLine size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {analytics.categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package size={20} className="text-[#444444]" />
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-500">{category.trades} trades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{(category.amount / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-gray-600">{category.percentage}%</p>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#444444] to-[#666666] h-full rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seasonal Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar size={24} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Insights & Predictions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.seasonalInsights.map((insight, index) => (
              <div key={index} className="bg-white rounded-xl p-4">
                <p className="font-semibold text-gray-900 mb-1">{insight.season}</p>
                <p className="text-sm text-gray-600 mb-2">{insight.pattern}</p>
                <div className="flex items-center space-x-2">
                  <TrendUp size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-600">{insight.impact}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-white rounded-xl border-2 border-blue-300">
            <p className="text-sm font-medium text-blue-900">💡 Recommendation: Stock up on Electronics inventory in July-August for peak season sales (typically 45% higher volume)</p>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <TrendUp size={20} className="text-green-600 mt-1" />
              <div>
                <p className="font-medium text-green-900">Optimize Supplier Mix</p>
                <p className="text-sm text-green-700">German Machinery Ltd shows 31.2% margin vs 23.5% average. Consider increasing orders by 15-20%.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Calendar size={20} className="text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-blue-900">Seasonal Planning</p>
                <p className="text-sm text-blue-700">Q4 historically shows 35% volume increase. Secure supplier commitments now for December rush.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Target size={20} className="text-purple-600 mt-1" />
              <div>
                <p className="font-medium text-purple-900">Growth Opportunity</p>
                <p className="text-sm text-purple-700">Your trade volume qualifies for Premium tier. Unlock 0.3% fee reduction and priority support.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
     </Layout>
  );
};

export default AnalyticsDashboard;