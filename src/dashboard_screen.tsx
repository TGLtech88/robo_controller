import React, { useEffect, useRef } from 'react';
import { Bluetooth, Activity, ShieldAlert, Cpu, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Octagon } from 'lucide-react';
import { useBluetooth } from './bluetooth_service';

export function DashboardScreen() {
  const { connectedDevice, disconnect, mode, setMode, logs, sendCommand, obstacleDistance, signalStrength } = useBluetooth();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handlePress = (cmd: string) => {
    if (mode === 'manual') sendCommand(cmd);
  };

  return (
    <>
      {/* Central Control Area */}
      <div className="col-span-6 flex flex-col gap-6 overflow-hidden">
        {/* Mode Toggles */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div 
            onClick={() => setMode('manual')}
            className={`cursor-pointer bg-[#151515] border border-[#333333] p-4 rounded-lg flex justify-between items-center transition-opacity ${mode === 'manual' ? 'opacity-100' : 'opacity-50'}`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-white">Manual Override</span>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${mode === 'manual' ? 'bg-[#FFC107]' : 'bg-[#333333]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${mode === 'manual' ? 'right-1 bg-black' : 'left-1 bg-gray-500'}`}></div>
            </div>
          </div>
          <div 
            onClick={() => setMode('auto')}
            className={`cursor-pointer bg-[#151515] border border-[#333333] p-4 rounded-lg flex justify-between items-center transition-opacity ${mode === 'auto' ? 'opacity-100' : 'opacity-50'}`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-white">Ultrasonic Auto</span>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${mode === 'auto' ? 'bg-[#FFC107]' : 'bg-[#333333]'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${mode === 'auto' ? 'right-1 bg-black' : 'left-1 bg-gray-500'}`}></div>
            </div>
          </div>
        </div>

        {/* D-PAD CONTROLS */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#151515] rounded-lg border border-[#333333] relative min-h-[300px]">
          <div className={`grid grid-cols-3 gap-4 transition-opacity duration-300 ${mode === 'auto' ? 'opacity-30 pointer-events-none' : ''}`}>
            <div></div>
            <ControlButton icon={<ArrowUp className="w-12 h-12" />} onClick={() => handlePress('1')} />
            <div></div>

            <ControlButton icon={<ArrowLeft className="w-12 h-12" />} onClick={() => handlePress('3')} />
            <button 
              onClick={() => handlePress('0')}
              className="w-24 h-24 bg-[#FF4444] rounded-full shadow-[0_0_20px_rgba(255,68,68,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="font-black text-xl text-white">STOP</span>
            </button>
            <ControlButton icon={<ArrowRight className="w-12 h-12" />} onClick={() => handlePress('4')} />

            <div></div>
            <ControlButton icon={<ArrowDown className="w-12 h-12" />} onClick={() => handlePress('2')} />
            <div></div>
          </div>

          {/* Direction Indicators */}
          <div className="absolute bottom-4 left-4 text-[10px] text-gray-600 font-mono">
            KEYBIND: WASD / ARROWS
          </div>
        </div>
      </div>

      {/* Right Side: Analytics & Logs */}
      <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
        {/* Stat Cards */}
        <div className="space-y-4 shrink-0">
          <div className="bg-[#151515] border border-[#333333] p-4 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Obstacle Distance</p>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-black text-[#FFC107]">{obstacleDistance}</span>
              <span className="text-sm text-[#FFC107] mb-1">cm</span>
            </div>
            <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${obstacleDistance < 20 ? 'bg-red-500' : 'bg-[#FFC107]'}`} 
                style={{ width: `${Math.min(100, (obstacleDistance / 400) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-[#151515] border border-[#333333] p-4 rounded-lg">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Signal Strength</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#FFC107]">{signalStrength}</span>
              <span className="text-sm text-[#FFC107] mb-1">dBm</span>
            </div>
          </div>
        </div>

        {/* Command Log */}
        <div className="flex-1 bg-[#0a0a0a] border border-[#333333] rounded-lg flex flex-col p-3 overflow-hidden min-h-[200px]">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-[#333333] pb-1 shrink-0">
            System Command Log
          </h3>
          <div className="flex-1 font-mono text-[10px] space-y-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
            {logs.map((log, i) => (
              <p key={i}>
                <span className={log.type === 'error' ? 'text-red-400' : log.type === 'info' ? 'text-blue-400' : 'text-[#FFC107]'}>
                  [{log.time}]
                </span>{' '}
                <span className="text-gray-400">
                  {log.type === 'command' ? `Command SENT: ${log.message.replace('TX: ', '')}` : log.message}
                </span>
              </p>
            ))}
            <div className="animate-pulse border-l-2 border-[#FFC107] pl-1 text-gray-400">_</div>
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </>
  );
}

function ControlButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-24 h-24 bg-[#222222] border-2 border-[#FFC107] rounded-xl flex items-center justify-center text-[#FFC107] hover:bg-[#FFC107] hover:text-black transition-all group active:scale-95"
    >
      <div className="group-hover:text-black transition-colors">
        {icon}
      </div>
    </button>
  );
}
