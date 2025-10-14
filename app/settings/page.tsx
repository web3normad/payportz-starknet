"use client"
import React, { useState } from 'react';
import { Gear, Bell, Shield, Palette, Globe, CreditCard, Key, Database } from '@phosphor-icons/react';
import Layout from '../components/core/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true,
      tradeUpdates: true,
      disputeAlerts: true,
      systemMaintenance: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: '30',
      loginAlerts: true,
      apiAccess: false
    },
    platform: {
      maintenanceMode: false,
      newUserRegistration: true,
      autoApproveVerification: false,
      maxTradeAmount: '100000',
      minTradeAmount: '10'
    }
  });

  const sections = [
    { id: 'general', label: 'General', icon: Gear },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'platform', label: 'Platform', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key }
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7777777] focus:ring-offset-2 ${
          enabled ? 'bg-[#444444]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="PaySlab"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="admin@payslab.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Support URL</label>
                  <input
                    type="url"
                    defaultValue="https://support.payslab.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent">
                    <option>UTC+1 (West Africa Time)</option>
                    <option>UTC (Greenwich Mean Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-1">
                <ToggleSwitch
                  enabled={settings.notifications.email}
                  onChange={(value) => updateSetting('notifications', 'email', value)}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                <ToggleSwitch
                  enabled={settings.notifications.push}
                  onChange={(value) => updateSetting('notifications', 'push', value)}
                  label="Push Notifications"
                  description="Receive browser push notifications"
                />
                <ToggleSwitch
                  enabled={settings.notifications.sms}
                  onChange={(value) => updateSetting('notifications', 'sms', value)}
                  label="SMS Notifications"
                  description="Receive critical alerts via SMS"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Types</h3>
              <div className="space-y-1">
                <ToggleSwitch
                  enabled={settings.notifications.tradeUpdates}
                  onChange={(value) => updateSetting('notifications', 'tradeUpdates', value)}
                  label="Trade Updates"
                  description="Notifications for trade status changes"
                />
                <ToggleSwitch
                  enabled={settings.notifications.disputeAlerts}
                  onChange={(value) => updateSetting('notifications', 'disputeAlerts', value)}
                  label="Dispute Alerts"
                  description="Immediate alerts for new disputes"
                />
                <ToggleSwitch
                  enabled={settings.notifications.systemMaintenance}
                  onChange={(value) => updateSetting('notifications', 'systemMaintenance', value)}
                  label="System Maintenance"
                  description="Scheduled maintenance notifications"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
              <div className="space-y-1">
                <ToggleSwitch
                  enabled={settings.security.twoFactorAuth}
                  onChange={(value) => updateSetting('security', 'twoFactorAuth', value)}
                  label="Two-Factor Authentication"
                  description="Require 2FA for admin access"
                />
                <ToggleSwitch
                  enabled={settings.security.loginAlerts}
                  onChange={(value) => updateSetting('security', 'loginAlerts', value)}
                  label="Login Alerts"
                  description="Email alerts for new admin logins"
                />
                <ToggleSwitch
                  enabled={settings.security.apiAccess}
                  onChange={(value) => updateSetting('security', 'apiAccess', value)}
                  label="API Access"
                  description="Enable API access for integrations"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <select 
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'platform':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Controls</h3>
              <div className="space-y-1">
                <ToggleSwitch
                  enabled={settings.platform.maintenanceMode}
                  onChange={(value) => updateSetting('platform', 'maintenanceMode', value)}
                  label="Maintenance Mode"
                  description="Put platform in maintenance mode"
                />
                <ToggleSwitch
                  enabled={settings.platform.newUserRegistration}
                  onChange={(value) => updateSetting('platform', 'newUserRegistration', value)}
                  label="New User Registration"
                  description="Allow new users to register"
                />
                <ToggleSwitch
                  enabled={settings.platform.autoApproveVerification}
                  onChange={(value) => updateSetting('platform', 'autoApproveVerification', value)}
                  label="Auto-approve Verification"
                  description="Automatically approve user verifications"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trade Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Trade Amount (USD)</label>
                  <input
                    type="number"
                    value={settings.platform.minTradeAmount}
                    onChange={(e) => updateSetting('platform', 'minTradeAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Trade Amount (USD)</label>
                  <input
                    type="number"
                    value={settings.platform.maxTradeAmount}
                    onChange={(e) => updateSetting('platform', 'maxTradeAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#444444] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gear size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600">This settings section is under development.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="p-6 w-full">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Manage your platform configuration and preferences</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                Export Config
              </Button>
              <Button>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                          activeSection === section.id 
                            ? 'bg-[#444444] text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <Card>
                {renderSectionContent()}
                
                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">
                      Reset to Defaults
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* System Status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                <p className="text-sm text-gray-600">Current platform health and statistics</p>
              </div>
              <StatusBadge status="success">All Systems Operational</StatusBadge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">145ms</p>
                <p className="text-sm text-gray-600">Response Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">2.4M</p>
                <p className="text-sm text-gray-600">Total Transactions</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;