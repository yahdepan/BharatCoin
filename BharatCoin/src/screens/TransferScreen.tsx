import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useApp, WALLET_ADDRESS } from '../context/AppContext';

const C = {
  bg: '#F0F4FF', surface: '#FFFFFF', navy: '#0D1B4B',
  blue: '#1A56DB', accent: '#00C2FF', border: '#D6E0FF',
  muted: '#8A9BBF', green: '#10B981', red: '#EF4444',
  text: '#0D1B4B', subtext: '#6B7A99', light: '#E8EFFF',
};

const WALLETS = ['MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'WazirX', 'CoinDCX'];

export default function TransferScreen() {
  const { coins, sendCoins } = useApp();
  const [mode, setMode] = useState('receive');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  const handleSend = () => {
    if (!amount || !address) {
      Toast.show({ type: 'error', text1: 'Fill in all fields ⚠️', visibilityTime: 2000 });
      return;
    }
    const result = sendCoins(amount, address);
    if (!result.success) {
      Toast.show({ type: 'error', text1: result.error, visibilityTime: 2000 });
      return;
    }
    Toast.show({ type: 'success', text1: `Sent ${amount} BHC ✅`, text2: `To: ${address.slice(0, 20)}...`, visibilityTime: 2500 });
    setAmount('');
    setAddress('');
  };

  const copyAddress = () => {
    Clipboard.setString(WALLET_ADDRESS);
    Toast.show({ type: 'success', text1: 'Address copied! ✓', visibilityTime: 1500 });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Toggle */}
      <View style={styles.toggle}>
        {['receive', 'send'].map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]} activeOpacity={0.8}>
            <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
              {m === 'receive' ? '📥 Receive' : '📤 Send'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'receive' ? (
        <>
          {/* QR Card */}
          <View style={styles.qrCard}>
            <View style={styles.qrWrap}>
              <QRCode
                value={WALLET_ADDRESS}
                size={180}
                color={C.navy}
                backgroundColor="#FFFFFF"
                logo={require('../assets/logo.png')}
                logoSize={30}
                logoBackgroundColor="#FFFFFF"
                logoBorderRadius={8}
              />
            </View>
            <Text style={styles.walletAddr}>{WALLET_ADDRESS}</Text>
            <TouchableOpacity onPress={copyAddress} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>Copy Address</Text>
            </TouchableOpacity>
          </View>

          {/* Compatible wallets */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>COMPATIBLE WALLETS</Text>
            {WALLETS.map((w, i) => (
              <View key={w} style={[styles.walletRow, i < WALLETS.length - 1 && styles.walletRowBorder]}>
                <Text style={styles.walletName}>{w}</Text>
                <View style={styles.supportBadge}>
                  <Text style={styles.supportText}>Supported</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {/* Amount */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.000000"
                placeholderTextColor={C.muted}
                style={styles.amountInput}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity onPress={() => setAmount(coins.toFixed(6))} style={styles.maxBtn}>
                <Text style={styles.maxText}>MAX</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.available}>Available: {coins.toFixed(6)} BHC</Text>
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>RECIPIENT ADDRESS</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="BHC1... or 0x..."
              placeholderTextColor={C.muted}
              style={styles.addressInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Scan QR */}
          <TouchableOpacity style={styles.scanCard} onPress={() => Toast.show({ type: 'info', text1: 'Camera scanner coming soon 📷', visibilityTime: 2000 })} activeOpacity={0.8}>
            <View style={styles.scanIcon}><Text style={{ fontSize: 22 }}>📷</Text></View>
            <View>
              <Text style={styles.scanTitle}>Scan QR Code</Text>
              <Text style={styles.scanSub}>Scan recipient's BHC address</Text>
            </View>
          </TouchableOpacity>

          {/* Send button */}
          <TouchableOpacity onPress={handleSend} activeOpacity={0.85}>
            <LinearGradient colors={[C.blue, C.accent]} style={styles.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.sendBtnText}>Send BharatCoin →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  toggle: { flexDirection: 'row', backgroundColor: C.light, borderRadius: 12, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: C.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '500', color: C.muted },
  toggleTextActive: { color: C.blue, fontWeight: '700' },
  qrCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center', gap: 14 },
  qrWrap: { padding: 12, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  walletAddr: { fontFamily: 'monospace', fontSize: 11, color: C.subtext, textAlign: 'center', lineHeight: 18 },
  copyBtn: { backgroundColor: C.light, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 7 },
  copyBtnText: { fontSize: 13, color: C.blue, fontWeight: '600' },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: C.muted, letterSpacing: 0.6, marginBottom: 10 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  walletRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  walletName: { fontSize: 14, color: C.text },
  supportBadge: { backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  supportText: { fontSize: 11, color: C.green, fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amountInput: { flex: 1, fontSize: 26, color: C.blue, fontFamily: 'monospace', fontWeight: '500', padding: 0 },
  maxBtn: { backgroundColor: C.light, borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  maxText: { fontSize: 12, color: C.blue, fontWeight: '600' },
  available: { fontSize: 11, color: C.muted, marginTop: 6 },
  addressInput: { fontSize: 13, color: C.text, fontFamily: 'monospace', padding: 0 },
  scanCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  scanIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: C.light, borderWidth: 2, borderColor: C.blue, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  scanTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  scanSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  sendBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: C.blue, shadowOpacity: 0.4, shadowRadius: 12, elevation: 4 },
  sendBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});
