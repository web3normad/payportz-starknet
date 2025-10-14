"use client";
import React, { useState } from 'react';
import Layout from '../components/core/Layout';
import { 
  FileText,
  Download,
  CheckCircle,
  Shield,
  Calendar,
  Building,
  CurrencyDollar,
  Printer,
  Share,
  Eye,
  Funnel,
  MagnifyingGlass
} from '@phosphor-icons/react';

const ComplianceCenter = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-quarter');
  const [documentFilter, setDocumentFilter] = useState('all');

  // Mock compliance data
  const complianceData = {
    bvnStatus: 'Verified',
    tinNumber: '12345678-0001',
    cacNumber: 'RC-1234567',
    verificationDate: 'Jan 15, 2024',
    nextAudit: 'Apr 1, 2024',
    
    documents: [
      {
        id: 'INV-001',
        type: 'Invoice',
        title: 'Trade Invoice - Shanghai Electronics',
        date: '2024-01-28',
        amount: '₦12,500,000',
        taxAmount: '₦937,500',
        status: 'Generated',
        format: 'PDF'
      },
      {
        id: 'TAX-Q4-2024',
        type: 'Tax Report',
        title: 'Q4 2024 VAT Summary',
        date: '2024-01-15',
        amount: '₦3,562,500',
        taxAmount: '₦267,187',
        status: 'Ready for FIRS',
        format: 'Excel'
      },
      {
        id: 'AUDIT-2024',
        type: 'Audit Trail',
        title: '2024 Complete Transaction History',
        date: '2024-01-20',
        amount: '₦47,500,000',
        taxAmount: '₦3,562,500',
        status: 'Bank-ready',
        format: 'PDF'
      },
      {
        id: 'INV-002',
        type: 'Invoice',
        title: 'Trade Invoice - Dubai Textile',
        date: '2024-01-25',
        amount: '₦8,200,000',
        taxAmount: '₦615,000',
        status: 'Generated',
        format: 'PDF'
      },
      {
        id: 'CERT-001',
        type: 'Certificate',
        title: 'Trade Finance Certificate',
        date: '2024-01-10',
        amount: '-',
        taxAmount: '-',
        status: 'Issued',
        format: 'PDF'
      }
    ],

    taxSummary: {
      quarter: 'Q4 2024',
      totalRevenue: 47500000,
      totalVAT: 3562500,
      totalWHT: 237500,
      netTaxable: 43700000,
      filingDeadline: 'Jan 31, 2024',
      filingStatus: 'Ready to submit'
    },

    upcomingRequirements: [
      { task: 'Q1 2024 VAT Return', deadline: 'Apr 30, 2024', status: 'upcoming' },
      { task: 'Annual Financial Statement', deadline: 'Mar 31, 2024', status: 'upcoming' },
      { task: 'Trade License Renewal', deadline: 'Jun 15, 2024', status: 'upcoming' }
    ]
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'generated':
      case 'issued':
        return 'bg-green-100 text-green-700';
      case 'ready for firs':
      case 'bank-ready':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDocuments = documentFilter === 'all' 
    ? complianceData.documents 
    : complianceData.documents.filter(doc => doc.type.toLowerCase() === documentFilter.toLowerCase());

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
            <p className="text-gray-600 mt-1">Auto-generated documents for banks and tax authorities</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
            >
              <option value="current-quarter">Current Quarter</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="ytd">Year to Date</option>
              <option value="all-time">All Time</option>
            </select>
            <button className="px-4 py-2 bg-[#444444] text-white rounded-xl hover:bg-[#333333] flex items-center space-x-2">
              <Download size={16} />
              <span>Export All</span>
            </button>
          </div>
        </div>

        {/* Verification Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">BVN Status</span>
              <CheckCircle size={20} className="text-green-600" weight="fill" />
            </div>
            <p className="text-xl font-bold text-gray-900">{complianceData.bvnStatus}</p>
            <p className="text-xs text-gray-500 mt-1">Since {complianceData.verificationDate}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">TIN Number</span>
              <Building size={20} className="text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{complianceData.tinNumber}</p>
            <p className="text-xs text-gray-500 mt-1">FIRS Registered</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">CAC Number</span>
              <Shield size={20} className="text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{complianceData.cacNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Business Registered</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Next Audit</span>
              <Calendar size={20} className="text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{complianceData.nextAudit}</p>
            <p className="text-xs text-gray-500 mt-1">68 days away</p>
          </div>
        </div>

        {/* Tax Summary Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">{complianceData.taxSummary.quarter} Tax Summary</h3>
              <p className="text-blue-100">Auto-calculated and ready for FIRS submission</p>
            </div>
            <button className="px-4 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-medium flex items-center space-x-2">
              <Download size={16} />
              <span>File with FIRS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">₦{(complianceData.taxSummary.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">VAT Collected</p>
              <p className="text-2xl font-bold">₦{(complianceData.taxSummary.totalVAT / 1000000).toFixed(2)}M</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Withholding Tax</p>
              <p className="text-2xl font-bold">₦{(complianceData.taxSummary.totalWHT / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Filing Deadline</p>
              <p className="text-2xl font-bold">{complianceData.taxSummary.filingDeadline.split(',')[0]}</p>
              <p className="text-xs text-blue-100 mt-1">{complianceData.taxSummary.filingStatus}</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Generated Documents</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] w-64"
                />
              </div>
              <select 
                value={documentFilter}
                onChange={(e) => setDocumentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444]"
              >
                <option value="all">All Documents</option>
                <option value="invoice">Invoices</option>
                <option value="tax report">Tax Reports</option>
                <option value="audit trail">Audit Trails</option>
                <option value="certificate">Certificates</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <FileText size={24} className="text-[#444444]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{doc.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">{doc.type} • {doc.date}</span>
                      {doc.amount !== '-' && (
                        <>
                          <span className="text-sm font-medium text-gray-700">{doc.amount}</span>
                          {doc.taxAmount !== '-' && (
                            <span className="text-sm text-gray-500">Tax: {doc.taxAmount}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{doc.format}</span>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Share size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#444444] hover:bg-gray-50 transition-all text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-[#444444]" />
                    <div>
                      <p className="font-medium text-gray-900">Generate New Invoice</p>
                      <p className="text-sm text-gray-500">Create FIRS-compliant invoice</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#444444] hover:bg-gray-50 transition-all text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollar size={20} className="text-[#444444]" />
                    <div>
                      <p className="font-medium text-gray-900">Export Tax Report</p>
                      <p className="text-sm text-gray-500">Ready for FIRS e-filing</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#444444] hover:bg-gray-50 transition-all text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Printer size={20} className="text-[#444444]" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Audit Package</p>
                      <p className="text-sm text-gray-500">Complete transaction history</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-[#444444] hover:bg-gray-50 transition-all text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield size={20} className="text-[#444444]" />
                    <div>
                      <p className="font-medium text-gray-900">Compliance Certificate</p>
                      <p className="text-sm text-gray-500">For supplier/bank verification</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </button>
            </div>
          </div>

          {/* Upcoming Requirements */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Requirements</h3>
            <div className="space-y-4">
              {complianceData.upcomingRequirements.map((req, index) => (
                <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3">
                      <Calendar size={20} className="text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">{req.task}</p>
                        <p className="text-sm text-blue-700 mt-1">Due: {req.deadline}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                      Upcoming
                    </span>
                  </div>
                  <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Set Reminder →
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle size={20} className="text-green-600" weight="fill" />
                <p className="font-medium text-green-900">All Current Filings Complete</p>
              </div>
              <p className="text-sm text-green-700">You're up to date with all compliance requirements for this quarter.</p>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Why Our Compliance Automation Matters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">⚡ Instant Generation</h4>
              <p className="text-sm text-gray-300">All documents auto-generated from your transaction data. No manual data entry.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🏦 Bank-Ready</h4>
              <p className="text-sm text-gray-300">Complete audit trails acceptable by Nigerian banks for loan applications.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✅ FIRS-Compliant</h4>
              <p className="text-sm text-gray-300">Tax reports match FIRS requirements exactly. Ready for e-filing.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
     </Layout>
  );
};

export default ComplianceCenter;