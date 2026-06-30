import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

// Common BLE UUIDs for serial communication
const NORDIC_UART_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const NORDIC_UART_TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

const ESP32_DEFAULT_SERVICE = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const ESP32_DEFAULT_CHAR = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export interface BluetoothDeviceData {
  name: string;
  mac: string;
  rssi: number;
}

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'command' | 'error';
}

interface BluetoothContextType {
  connectedDevice: BluetoothDeviceData | null;
  isConnecting: boolean;
  requestAndConnect: () => Promise<void>;
  disconnect: () => void;
  mode: 'manual' | 'auto';
  setMode: (mode: 'manual' | 'auto') => void;
  logs: LogEntry[];
  sendCommand: (cmd: string) => void;
  obstacleDistance: number;
  signalStrength: number;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDeviceData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mode, setMode] = useState<'manual' | 'auto'>('manual');
  const [logs, setLogs] = useState<LogEntry[]>([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Web Bluetooth API ready.', type: 'info' }]);
  const [obstacleDistance, setObstacleDistance] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);

  const bleDeviceRef = useRef<any>(null);
  const writeCharacteristicRef = useRef<any>(null);

  const addLog = (message: string, type: 'info' | 'command' | 'error' = 'info') => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  const handleNotifications = (event: any) => {
    const value = event.target.value;
    const decoder = new TextDecoder('utf-8');
    const data = decoder.decode(value);
    
    // Parse incoming data (example format: "D:45,S:-60" for distance and signal)
    if (data.includes('D:')) {
       const match = data.match(/D:(\d+)/);
       if (match) setObstacleDistance(parseInt(match[1]));
    }
    
    addLog(`RX: ${data.trim()}`, 'info');
  };

  const requestAndConnect = async () => {
    if (!navigator.bluetooth) {
      addLog('Web Bluetooth API is not available in this browser.', 'error');
      return;
    }

    try {
      setIsConnecting(true);
      addLog('Requesting Bluetooth Device...', 'info');

      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [NORDIC_UART_SERVICE, ESP32_DEFAULT_SERVICE]
      });

      addLog(`Connecting to GATT Server on ${device.name || 'Unknown Device'}...`, 'info');
      
      const server = await device.gatt.connect();
      bleDeviceRef.current = device;

      device.addEventListener('gattserverdisconnected', () => {
        addLog(`Disconnected from ${device.name}`, 'error');
        setConnectedDevice(null);
        writeCharacteristicRef.current = null;
      });

      let service, writeChar;
      
      try {
        // Try Nordic UART first
        service = await server.getPrimaryService(NORDIC_UART_SERVICE);
        writeChar = await service.getCharacteristic(NORDIC_UART_RX);
        const readChar = await service.getCharacteristic(NORDIC_UART_TX);
        await readChar.startNotifications();
        readChar.addEventListener('characteristicvaluechanged', handleNotifications);
        addLog('Connected via Nordic UART Service', 'info');
      } catch (e) {
        try {
          // Try generic ESP32 standard service
          service = await server.getPrimaryService(ESP32_DEFAULT_SERVICE);
          writeChar = await service.getCharacteristic(ESP32_DEFAULT_CHAR);
          // Assuming single char for RX/TX if Nordic fails
          try {
            await writeChar.startNotifications();
            writeChar.addEventListener('characteristicvaluechanged', handleNotifications);
          } catch(e3) {
             // Not all setups have notify on the write char
          }
          addLog('Connected via standard ESP32 Service', 'info');
        } catch (e2) {
          addLog('Connected, but no recognized UART service found.', 'error');
        }
      }

      writeCharacteristicRef.current = writeChar;

      setConnectedDevice({
        name: device.name || 'ESP32 Robot',
        mac: device.id, 
        rssi: -50 
      });
      
      addLog(`Connection established.`, 'info');

    } catch (error: any) {
      addLog(`Connection failed: ${error.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (bleDeviceRef.current && bleDeviceRef.current.gatt.connected) {
      bleDeviceRef.current.gatt.disconnect();
    }
    setConnectedDevice(null);
    writeCharacteristicRef.current = null;
    addLog('Disconnected manually', 'info');
  };

  const sendCommand = async (cmd: string) => {
    if (!writeCharacteristicRef.current) {
      addLog('Cannot send: No write characteristic available', 'error');
      return;
    }
    
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(cmd);
      await writeCharacteristicRef.current.writeValue(data);
      addLog(`TX: ${cmd}`, 'command');
    } catch (error: any) {
      addLog(`Send failed: ${error.message}`, 'error');
    }
  };

  return (
    <BluetoothContext.Provider value={{ connectedDevice, isConnecting, requestAndConnect, disconnect, mode, setMode, logs, sendCommand, obstacleDistance, signalStrength }}>
      {children}
    </BluetoothContext.Provider>
  );
}

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error('useBluetooth must be used within a BluetoothProvider');
  return context;
};
