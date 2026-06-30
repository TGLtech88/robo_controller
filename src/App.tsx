/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BluetoothProvider, useBluetooth } from './bluetooth_service';
import { DeviceSelectionScreen } from './device_selection_screen';
import { DashboardScreen } from './dashboard_screen';
import { Cpu } from 'lucide-react';

function AppContent() {
  const { connectedDevice } = useBluetooth();
  return (
    <div className="w-full h-screen bg-[#0D0D0D] text-white font-sans overflow-hidden flex flex-col p-6">
      {/* Header Section */}
      <header className="flex justify-between items-center border-b-2 border-[#FFC107] pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FFC107] flex items-center justify-center rounded-sm">
            <Cpu className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-[#FFC107] uppercase">RoboPilot Control System</h1>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">v4.0.2 // Autonomous Logic Active</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connectedDevice ? 'bg-[#FFC107] animate-pulse shadow-[0_0_8px_#FFC107]' : 'bg-red-500'}`}></div>
            <span className="text-xs font-bold uppercase tracking-widest">
              {connectedDevice ? `Bluetooth Connected: ${connectedDevice.name}` : 'Disconnected'}
            </span>
          </div>
          <div className="px-3 py-1 border border-[#FFC107] text-[#FFC107] text-[10px] font-bold rounded">
            {connectedDevice ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar: Device Selection */}
        <aside className="col-span-3 flex flex-col border border-[#333333] bg-[#151515] rounded-lg p-4 overflow-hidden">
          <DeviceSelectionScreen />
        </aside>

        {/* Central & Right Area */}
        {connectedDevice ? (
          <DashboardScreen />
        ) : (
          <div className="col-span-9 flex items-center justify-center border border-[#333333] bg-[#151515] rounded-lg">
            <div className="text-gray-500 font-mono text-sm tracking-widest uppercase animate-pulse">
              Awaiting connection...
            </div>
          </div>
        )}
      </main>

      {/* Footer Bar */}
      <footer className="mt-6 h-8 flex items-center justify-between px-4 border-t border-[#333333] bg-[#111111] text-[9px] uppercase tracking-widest font-bold text-gray-500 shrink-0">
        <div>STATUS: {connectedDevice ? 'TRANSMITTING' : 'IDLE'}</div>
        <div className="flex gap-4">
          <span>LATENCY: {connectedDevice ? '12ms' : '--'}</span>
          <span>BATTERY: 74%</span>
          <span>UPTIME: 00:14:22</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BluetoothProvider>
      <AppContent />
    </BluetoothProvider>
  );
}
