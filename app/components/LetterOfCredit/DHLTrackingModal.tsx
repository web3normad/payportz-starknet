// components/LetterOfCredit/DHLTrackingModal.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Package, X } from "@phosphor-icons/react";
import Card from "../ui/Card";
import { DHLShippingData } from './types';

interface DHLTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber?: string;
}

const DHLTrackingModal: React.FC<DHLTrackingModalProps> = ({
  isOpen,
  onClose,
  trackingNumber
}) => {
  const [trackingData, setTrackingData] = useState<DHLShippingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrackingData = async (trackingNum: string) => {
    setIsLoading(true);
    // Simulate DHL API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockData: DHLShippingData = {
      trackingNumber: trackingNum,
      carrier: 'DHL',
      status: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          timestamp: '2024-12-20T10:00:00Z',
          location: 'Shanghai, China',
          description: 'Shipment picked up',
          status: 'PICKED_UP'
        },
        {
          timestamp: '2024-12-21T14:30:00Z',
          location: 'Shanghai Airport, China',
          description: 'Departed facility',
          status: 'IN_TRANSIT'
        },
        {
          timestamp: '2024-12-22T08:15:00Z',
          location: 'Dubai Hub, UAE',
          description: 'In transit',
          status: 'IN_TRANSIT'
        },
        {
          timestamp: '2024-12-23T16:45:00Z',
          location: 'Lagos Airport, Nigeria',
          description: 'Arrived at destination',
          status: 'ARRIVED'
        }
      ]
    };
    
    setTrackingData(mockData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen && trackingNumber) {
      fetchTrackingData(trackingNumber);
    }
  }, [isOpen, trackingNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DHL Shipment Tracking</h2>
            <p className="text-gray-600 mt-1">Real-time shipment status via DHL API</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#444444]"></div>
            <span className="ml-3 text-gray-600">Fetching tracking data...</span>
          </div>
        ) : trackingData ? (
          <div className="space-y-6">
            {/* Tracking Header */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Tracking Number</h3>
                  <p className="font-mono text-blue-800">{trackingData.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-blue-900">Status</h3>
                  <p className="text-blue-800">{trackingData.status}</p>
                </div>
              </div>
              {trackingData.estimatedDelivery && (
                <div className="mt-4">
                  <h3 className="font-semibold text-blue-900">Estimated Delivery</h3>
                  <p className="text-blue-800">{new Date(trackingData.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Tracking Events */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipment History</h3>
              <div className="space-y-4">
                {trackingData.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-4 h-4 bg-[#444444] rounded-full mt-1"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.description}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.location}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tracking data available</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DHLTrackingModal;