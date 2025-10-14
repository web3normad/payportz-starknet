
"use client";
import React from 'react';
import { Fingerprint, Truck, Shield, Globe } from "@phosphor-icons/react";
import Card from "../ui/Card";

const FeaturesBanner: React.FC = () => {
  return (
    <Card className="bg-[linear-gradient(135deg,rgb(131,131,131)_-35%,rgba(41,41,41,0.34)_-20%,rgba(51,51,51,0.55)_-15%,rgb(47,47,47)_100%)] text-white border-0">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl mx-auto w-fit mb-2">
            <Fingerprint size={24} />
          </div>
          <p className="text-sm font-medium">NIN + BVN + CAC</p>
          <p className="text-xs opacity-75">Full KYC Integration</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl mx-auto w-fit mb-2">
            <Truck size={24} />
          </div>
          <p className="text-sm font-medium">DHL API</p>
          <p className="text-xs opacity-75">Real-time Tracking</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl mx-auto w-fit mb-2">
            <Shield size={24} />
          </div>
          <p className="text-sm font-medium">Smart Escrow</p>
          <p className="text-xs opacity-75">Automated Release</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl mx-auto w-fit mb-2">
            <Globe size={24} />
          </div>
          <p className="text-sm font-medium">Instant</p>
          <p className="text-xs opacity-75">vs 6-8 weeks banks</p>
        </div>
      </div>
    </Card>
  );
};

export default FeaturesBanner;