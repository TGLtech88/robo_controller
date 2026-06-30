import React from 'react';
import { Bluetooth, Loader2 } from 'lucide-react';
import { useBluetooth } from './bluetooth_service';

export function DeviceSelectionScreen() {
  const { requestAndConnect, isConnecting, connectedDevice, disconnect } = useBluetooth();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-sm font-bold text-[#FFC107] uppercase tracking-wider">Device Connection</h2>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
        {!connectedDevice && (
          <button
            onClick={requestAndConnect}
            disabled={isConnecting}
            className="p-4 border border-[#FFC107] bg-[#FFC107]/10 hover:bg-[#FFC107]/20 rounded cursor-pointer transition-colors flex items-center justify-center gap-3 w-full group disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-6 h-6 text-[#FFC107] animate-spin" />
            ) : (
              <Bluetooth className="w-6 h-6 text-[#FFC107] group-hover:scale-110 transition-transform" />
            )}
            <span className="font-bold text-[#FFC107] uppercase tracking-widest">
              {isConnecting ? 'Pairing...' : 'Pair New Device'}
            </span>
          </button>
        )}

        {connectedDevice && (
          <div className="p-3 border-l-4 border-[#FFC107] bg-[#1a1a1a] rounded transition-colors">
            <div className="flex items-center gap-3">
              <Bluetooth className="w-5 h-5 shrink-0 text-[#FFC107]" />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold truncate text-white">
                  {connectedDevice.name}
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  {connectedDevice.mac}
                </p>
              </div>
              <button 
                onClick={disconnect}
                className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase shrink-0"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#333333] shrink-0">
        <p className="text-[10px] text-gray-500 italic">
          Uses Web Bluetooth API. Requires Chrome/Edge. Ensure your ESP32 is powered on and broadcasting BLE.
        </p>
      </div>
    </div>
  );
}
