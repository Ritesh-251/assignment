'use client';

import { useIsBentoShell } from '../hooks/useIsBentoShell';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (message: string) => void;
    };
  }
}

export default function Page() {
  const [isBentoShell, setIsBentoShell] = useState(false);
  const [syncedData, setSyncedData] = useState<any>(null);

  useEffect(() => {
    if (window.navigator.userAgent.includes('BentoShell')) {
      setIsBentoShell(true);
    }

    const handleMessage = (event: any) => {
       try {
         if (typeof event.data === 'string') {
            const data = JSON.parse(event.data);
            if (data.deviceId) {
              setSyncedData(data);
            }
         }
       } catch (e) {
       }
    };

    (window as any).onDeviceData = (data: any) => {
      setSyncedData(data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSync = () => {
    if (!isBentoShell) {
      console.log("Device sync not available on web");
      alert("Device sync not available on web");
    } else {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage("Sync with Device");
      } else {
        console.warn("ReactNativeWebView not found");
      }
    }
  };

  return (
    <main>
      <h1>Unified Architecture Demo</h1>
      <p>Current View: {isBentoShell ? 'Mobile Shell' : 'Browser View'}</p>
      
      {!isBentoShell && (
        <button style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px' }}>
          Sign Up
        </button>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <button 
          onClick={handleSync}
          style={{ padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Sync with Device
        </button>

        {syncedData && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#e0ffe0', borderRadius: '5px' }}>
            <h3>Device Data Received:</h3>
            <pre>{JSON.stringify(syncedData, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
