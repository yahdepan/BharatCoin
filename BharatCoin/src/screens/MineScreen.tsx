import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#F0F4FF', surface: '#FFFFFF', navy: '#0D1B4B',
  blue: '#1A56DB', accent: '#00C2FF', border: '#D6E0FF',
  muted: '#8A9BBF', green: '#10B981', yellow: '#F59E0B',
  sky: '#4A90E2', text: '#0D1B4B', subtext: '#6B7A99',
};

export default function MineScreen() {
  const { coins, mining, setMining, mineRate, minedToday } = useApp();
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinFloat, { toValue: -8, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(coinFloat, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let interval;
    if (mining) {
      interval = setInterval(() => {
        setProgress(p => {
          const next = (p + 1.5) % 100;
          Animated.timing(progressAnim, {
            toValue: next / 100,
            duration: 150,
            useNativeDriver: false,
          }).start();
          return next;
        });
      }, 150);
    } else {
      setProgress(0);
      Animated.timing(progressAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
    return () => clearInterval(interval);
  }, [mining]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const toggleMine = () => {
    setMining(!mining);
    Toast.show({
      type: mining ? 'info' : 'success',
      text1: mining ? 'Mining stopped' : 'Mining started ⛏',
      text2: mining ? '' : 'Earning BHC in eco mode',
      visibilityTime: 2000,
    });
  };

  const stats = [
    { label: 'Mining Rate', value: mining ? `${mineRate}/hr` : '—', icon: '⚡️', color: C.blue },
    { label: 'Mined Today', value: minedToday.toFixed(4), icon: '📈', color: C.green },
    { label: 'Power Mode', value: 'Eco 🌱', icon: '🔋', color: C.yellow },
    { label: 'Network', value: 'P2P Active', icon: '🌐', color: C.sky },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Balance Card */}
      <LinearGradient colors={[C.navy, C.blue]} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Animated.View style={[styles.coinIcon, { transform: [{ translateY: coinFloat }] }]}>
          <Text style={styles.coinEmoji}>₿</Text>
        </Animated.View>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceValue}>{coins.toFixed(6)}</Text>
        <Text style={styles.balanceSub}>BharatCoin · ≈ ₹{(coins * 2.4).toFixed(2)}</Text>

        {mining && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Mining block...</Text>
              <Text style={styles.progressLabel}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Mine Button */}
      <TouchableOpacity onPress={toggleMine} activeOpacity={0.85}>
        {mining ? (
          <View style={[styles.mineBtn, styles.mineBtnStop]}>
            <Text style={[styles.mineBtnText, { color: '#EF4444' }]}>⏹  Stop Mining</Text>
          </View>
        ) : (
          <LinearGradient colors={[C.blue, C.accent]} style={styles.mineBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.mineBtnText}>⛏  Start Mining</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Eco mode mines every 10 seconds to preserve battery. Mining continues while you chat or make calls.
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  balanceCard: { borderRadius: 20, padding: 22, overflow: 'hidden', position: 'relative' },
  circle1: { position: 'absolute', top: -24, right: -24, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' },
  circle2: { position: 'absolute', bottom: -30, right: 20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.04)' },
  coinIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  coinEmoji: { fontSize: 26, color: '#fff' },
  balanceLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  balanceValue: { fontSize: 30, color: '#fff', fontWeight: '500', letterSpacing: -0.5, fontFamily: 'monospace' },
  balanceSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  progressContainer: { marginTop: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#00C2FF', borderRadius: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
  statLabel: { fontSize: 11, color: C.muted, marginTop: 2 },
  mineBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  mineBtnStop: { backgroundColor: C.surface, borderWidth: 2, borderColor: C.border },
  mineBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  infoCard: { backgroundColor: 'rgba(26,86,219,0.06)', borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  infoIcon: { fontSize: 16 },
  infoText: { fontSize: 12, color: C.subtext, lineHeight: 19, flex: 1 },
});
