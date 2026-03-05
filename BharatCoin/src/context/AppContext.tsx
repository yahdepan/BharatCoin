import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import BackgroundTimer from 'react-native-background-timer';
import uuid from 'react-native-uuid';

const AppContext = createContext(null);

export const WALLET_ADDRESS = 'BHC1x9f3K7mN2pQrT8vYwZa4bCdE6gHjL';

export function AppProvider({ children }) {
  const [coins, setCoins] = useState(142.857341);
  const [mining, setMining] = useState(false);
  const [mineRate, setMineRate] = useState(0);
  const [minedToday, setMinedToday] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [messages, setMessages] = useState([
    { id: '1', from: 'Arjun', text: 'Hey! Just received 5 BHC 🎉', time: '9:41 AM', mine: false },
    { id: '2', from: 'Me', text: 'Mining is active, earning fast!', time: '9:42 AM', mine: true },
    { id: '3', from: 'Priya', text: 'Share your QR code with me', time: '9:43 AM', mine: false },
  ]);

  const mineTimerRef = useRef(null);

  // Persist coins
  useEffect(() => {
    AsyncStorage.getItem('bhc_coins').then(val => {
      if (val) setCoins(parseFloat(val));
    });
    AsyncStorage.getItem('bhc_mined_today').then(val => {
      if (val) setMinedToday(parseFloat(val));
    });
    AsyncStorage.getItem('bhc_messages').then(val => {
      if (val) setMessages(JSON.parse(val));
    });
    AsyncStorage.getItem('bhc_offline_queue').then(val => {
      if (val) setOfflineQueue(JSON.parse(val));
    });
  }, []);

  // Monitor network
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
      if (online) syncOfflineMessages();
    });
    return () => unsub();
  }, [offlineQueue]);

  // Background mining (battery efficient — every 10s)
  useEffect(() => {
    if (mining) {
      mineTimerRef.current = BackgroundTimer.setInterval(() => {
        const earned = parseFloat((Math.random() * 0.003 + 0.001).toFixed(6));
        setCoins(c => {
          const newVal = parseFloat((c + earned).toFixed(6));
          AsyncStorage.setItem('bhc_coins', String(newVal));
          return newVal;
        });
        setMinedToday(m => {
          const newVal = parseFloat((m + earned).toFixed(6));
          AsyncStorage.setItem('bhc_mined_today', String(newVal));
          return newVal;
        });
        setMineRate(parseFloat((earned * 3600).toFixed(4)));
      }, 10000);
    } else {
      if (mineTimerRef.current) BackgroundTimer.clearInterval(mineTimerRef.current);
      setMineRate(0);
    }
    return () => {
      if (mineTimerRef.current) BackgroundTimer.clearInterval(mineTimerRef.current);
    };
  }, [mining]);

  const sendMessage = useCallback((text) => {
    const msg = {
      id: String(uuid.v4()),
      from: 'Me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true,
      queued: !isOnline,
    };
    const updated = [...messages, msg];
    setMessages(updated);
    AsyncStorage.setItem('bhc_messages', JSON.stringify(updated));

    if (!isOnline) {
      const newQueue = [...offlineQueue, msg];
      setOfflineQueue(newQueue);
      AsyncStorage.setItem('bhc_offline_queue', JSON.stringify(newQueue));
    }
    return msg;
  }, [messages, isOnline, offlineQueue]);

  const syncOfflineMessages = useCallback(() => {
    if (offlineQueue.length > 0) {
      // Mark all queued messages as delivered
      setMessages(prev => prev.map(m => ({ ...m, queued: false })));
      setOfflineQueue([]);
      AsyncStorage.setItem('bhc_offline_queue', '[]');
      return offlineQueue.length;
    }
    return 0;
  }, [offlineQueue]);

  const sendCoins = useCallback((amount, address) => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return { success: false, error: 'Invalid amount' };
    if (amt > coins) return { success: false, error: 'Insufficient balance' };
    const newBal = parseFloat((coins - amt).toFixed(6));
    setCoins(newBal);
    AsyncStorage.setItem('bhc_coins', String(newBal));
    return { success: true };
  }, [coins]);

  return (
    <AppContext.Provider value={{
      coins, mining, setMining, mineRate, minedToday,
      isOnline, offlineQueue, messages, sendMessage,
      syncOfflineMessages, sendCoins,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
