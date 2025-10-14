"use client";
import React, { useState } from 'react';
import Layout from '../components/core/Layout';
import { 
  TrendUp,
  CheckCircle,
  Clock,
  Warning,
  CurrencyDollar,
  ShieldCheck,
  ChartLine,
  Bank,
  Star,
  Download,
  Share
} from '@phosphor-icons/react';

const CreditScorePage = () => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Mock credit data
  const creditScore = {
    score: 785,
    grade: 'Excellent',
    maxScore: 850,
    lastUpdated: '2 days ago',
    trend: '+45 points (3 months)',
    factors: [
      { 
        name: 'Payment History', 
        score: 95, 
        weight: 35,
        status: 'excellent',
        detail: '24/24 trades paid on time'
      },
      { 
        name: 'Trade Volume', 
        score: 88, 
        weight: 30,
        status: 'excellent',
        detail: '₦47.5M in 90 days'
      },
      { 
        name: 'Supplier Diversity', 
        score: 82, 
        weight: 15,
        status: 'good',
        detail: '8 different suppliers'
      },
      { 
        name: 'Account Age', 
        score: 75, 
        weight: 10,
        status: 'good',
        detail: '6 months active'
      },
      { 
        name: 'Dispute Rate', 
        score: 100, 
        weight: 10,
        status: 'excellent',
        detail: '0 disputes filed'
      }
    ],
    loanOffers: [
      {
        bank: 'GTBank Trade Finance',
        amount: 15000000,
        rate: 18.5,
        term: 90,
        approval: 'Pre-approved',
        requiredScore: 700,
        logo: '🏦'
      },
      {
        bank: 'First Bank SME Loan',
        amount: 10000000,
        rate: 21.0,
        term: 180,
        approval: 'Likely approved',
        requiredScore: 680,
        logo: '🏦'
      },
      {
        bank: 'Access Bank Quick Cash',
        amount: 5000000,
        rate: 24.5,
        term: 60,
        approval: 'Guaranteed approval',
        requiredScore: 650,
        logo: '🏦'
      }
    ],
    milestones: [
      { score: 800, benefit: 'Premium rates (sub-15%)', status: 'upcoming', points: 15 },
      { score: 750, benefit: 'Trade finance access', status: 'achieved', points: 0 },
      { score: 700, benefit: 'Standard loans', status: 'achieved', points: 0 },
      { score: 650, benefit: 'Basic credit line', status: 'achieved', points: 0 }
    ],
    recentActivity: [
      { date: '2 days ago', action: 'Completed trade on time', impact: '+8 points' },
      { date: '1 week ago', action: 'Reached ₦50M volume milestone', impact: '+12 points' },
      { date: '2 weeks ago', action: 'Added 2 new supplier relationships', impact: '+5 points' }
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 750) return 'bg-green-100';
    if (score >= 700) return 'bg-blue-100';
    if (score >= 650) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'good':
        return <TrendUp size={16} className="text-blue-600" />;
      case 'fair':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Warning size={16} className="text-red-600" />;
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trade Credit Score</h1>
            <p className="text-gray-600 mt-1">Your creditworthiness based on trade performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2">
              <Share size={16} />
              <span>Share with Bank</span>
            </button>
            <button className="px-4 py-2 bg-[#444444] text-white rounded-xl hover:bg-[#333333] flex items-center space-x-2">
              <Download size={16} />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-gradient-to-br from-[#444444] to-[#666666] rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck size={24} />
                  <span className="text-sm font-medium opacity-90">PaySlab Trade Credit Score</span>
                </div>
                <div className="flex items-baseline space-x-3">
                  <span className="text-6xl font-bold">{creditScore.score}</span>
                  <span className="text-2xl opacity-75">/ {creditScore.maxScore}</span>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    creditScore.grade === 'Excellent' ? 'bg-green-500 bg-opacity-20' : 'bg-blue-500 bg-opacity-20'
                  }`}>
                    {creditScore.grade}
                  </span>
                  <div className="flex items-center space-x-1 text-green-400">
                    <TrendUp size={16} />
                    <span className="text-sm">{creditScore.trend}</span>
                  </div>
                </div>
              </div>
              <div className="text-right opacity-90">
                <p className="text-sm mb-1">Last updated</p>
                <p className="text-lg font-semibold">{creditScore.lastUpdated}</p>
              </div>
            </div>

            {/* Score Range Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-75">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
              <div className="relative h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/4 bg-red-500"></div>
                  <div className="w-1/4 bg-yellow-500"></div>
                  <div className="w-1/4 bg-blue-500"></div>
                  <div className="w-1/4 bg-green-500"></div>
                </div>
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg"
                  style={{ left: `${(creditScore.score / creditScore.maxScore) * 100}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs opacity-75">
                <span>300</span>
                <span>550</span>
                <span>700</span>
                <span>850</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Credit Factors */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Score Breakdown</h3>
              <div className="space-y-4">
                {creditScore.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(factor.status)}
                        <span className="font-medium text-gray-900">{factor.name}</span>
                        <span className="text-xs text-gray-500">({factor.weight}% weight)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{factor.detail}</span>
                        <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                          {factor.score}/100
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            factor.score >= 90 ? 'bg-green-500' :
                            factor.score >= 80 ? 'bg-blue-500' :
                            factor.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-approved Loans */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pre-Approved Loan Offers</h3>
                <Bank size={20} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                {creditScore.loanOffers.map((offer, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedLoan === index 
                        ? 'border-[#444444] bg-gray-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedLoan(index)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{offer.logo}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{offer.bank}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              offer.approval === 'Pre-approved' ? 'bg-green-100 text-green-700' :
                              offer.approval === 'Likely approved' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {offer.approval}
                            </span>
                            <span className="text-xs text-gray-500">Min score: {offer.requiredScore}</span>
                          </div>
                        </div>
                      </div>
                      <CheckCircle 
                        size={24} 
                        weight={selectedLoan === index ? 'fill' : 'regular'}
                        className={selectedLoan === index ? 'text-[#444444]' : 'text-gray-300'}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Loan Amount</p>
                        <p className="font-semibold text-gray-900">₦{(offer.amount / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Interest Rate</p>
                        <p className="font-semibold text-gray-900">{offer.rate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Term</p>
                        <p className="font-semibold text-gray-900">{offer.term} days</p>
                      </div>
                    </div>
                    {selectedLoan === index && (
                      <button className="mt-3 w-full py-2 bg-[#444444] text-white rounded-lg hover:bg-[#333333] font-medium">
                        Apply Now
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Next Milestone */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Milestones</h3>
              <div className="space-y-3">
                {creditScore.milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-xl ${
                      milestone.status === 'achieved' ? 'bg-green-50 border border-green-200' :
                      milestone.status === 'upcoming' ? 'bg-blue-50 border border-blue-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold ${
                        milestone.status === 'achieved' ? 'text-green-900' :
                        milestone.status === 'upcoming' ? 'text-blue-900' :
                        'text-gray-900'
                      }`}>
                        {milestone.score}
                      </span>
                      {milestone.status === 'achieved' ? (
                        <CheckCircle size={20} className="text-green-600" weight="fill" />
                      ) : milestone.status === 'upcoming' ? (
                        <Star size={20} className="text-blue-600" />
                      ) : (
                        <Clock size={20} className="text-gray-400" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      milestone.status === 'achieved' ? 'text-green-800' :
                      milestone.status === 'upcoming' ? 'text-blue-800' :
                      'text-gray-600'
                    }`}>
                      {milestone.benefit}
                    </p>
                    {milestone.points > 0 && (
                      <p className="text-xs text-blue-600 mt-1">{milestone.points} points to unlock</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {creditScore.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{activity.date}</span>
                        <span className="text-xs font-medium text-green-600">{activity.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Improve */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-2 mb-4">
                <TrendUp size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">How to Improve</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-gray-700">Complete 5 more trades (+25 points)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-gray-700">Add 2 new suppliers (+10 points)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={16} className="text-blue-600 mt-0.5" />
                  <p className="text-gray-700">Maintain perfect payment record (+5 points/month)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">What Your Score Unlocks</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bank size={32} className="text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Bank Financing</h4>
              <p className="text-sm text-gray-600">Access working capital loans from Nigerian banks without collateral</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollar size={32} className="text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Better Rates</h4>
              <p className="text-sm text-gray-600">Unlock preferential interest rates and lower platform fees</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Supplier Trust</h4>
              <p className="text-sm text-gray-600">Share your score with suppliers for better payment terms</p>
            </div>
          </div>
        </div>

      </div>
    </div>
     </Layout>
  );
};

export default CreditScorePage;