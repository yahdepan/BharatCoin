import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Animated, Easing,
} from 'react-native';
import { RTCView, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#F0F4FF', surface: '#FFFFFF', navy: '#0D1B4B',
  blue: '#1A56DB', accent: '#00C2FF', border: '#D6E0FF',
  muted: '#8A9BBF', green: '#10B981', red: '#EF4444',
  text: '#0D1B4B',
};

const CONTACTS = [
  { id: '1', name: 'Arjun Singh', status: 'online' },
  { id: '2', name: 'Priya Sharma', status: 'online' },
  { id: '3', name: 'Rahul Dev', status: 'online' },
  { id: '4', name: 'Sneha Patel', status: 'away' },
];

function Avatar({ name, size = 42, colors = [C.blue, C.accent] }) {
  return (
    <LinearGradient colors={colors} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{name[0]}</Text>
    </LinearGradient>
  );
}

export default function VideoScreen() {
  const { mining, setMining } = useApp();
  const [inCall, setInCall] = useState(false);
  const [callee, setCallee] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const ringAnim = useRef(new Animated.Value(1)).current;
  const callTimer = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (inCall) {
      // Start ring animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1.6, duration: 1000, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(ringAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();

      // Call timer
      callTimer.current = setInterval(() => setCallTime(t => t + 1), 1000);

      // Get local media
      startLocalStream();
    } else {
      ringAnim.stopAnimation();
      clearInterval(callTimer.current);
      setCallTime(0);
      stopStreams();
    }
    return () => {
      clearInterval(callTimer.current);
      stopStreams();
    };
  }, [inCall]);

  const startLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setupPeerConnection(stream);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Camera/mic permission required', visibilityTime: 2000 });
    }
  };

  const setupPeerConnection = (stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = (event) => {
      if (event.streams?.[0]) setRemoteStream(event.streams[0]);
    };
    peerRef.current = pc;
  };

  const stopStreams = () => {
    localStream?.getTracks().forEach(t => t.stop());
    remoteStream?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();
    setLocalStream(null);
    setRemoteStream(null);
  };

  const startCall = (contact) => {
    setCallee(contact);
    setInCall(true);
    Toast.show({ type: 'info', text1: `Calling ${contact.name}... 📹`, visibilityTime: 2000 });
  };

  const endCall = () => {
    setInCall(false);
    setCallee(null);
    Toast.show({ type: 'info', text1: 'Call ended', visibilityTime: 1500 });
  };

  const toggleMute = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };

  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(v => !v);
  };

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (inCall) {
    return (
      <View style={styles.callContainer}>
        {/* Remote video */}
        {remoteStream ? (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
        ) : (
          <LinearGradient colors={[C.navy, '#071030']} style={styles.remoteVideo}>
            <Animated.View style={[styles.ring, { transform: [{ scale: ringAnim }], opacity: ringAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.5, 0] }) }]} />
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringAnim }], opacity: ringAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.3, 0] }) }]} />
            <Avatar name={callee?.name || 'U'} size={80} colors={[C.blue, C.accent]} />
            <Text style={styles.calleeName}>{callee?.name}</Text>
            <Text style={styles.callTimer}>{fmtTime(callTime)}</Text>
          </LinearGradient>
        )}

        {/* Mining pill */}
        {mining && (
          <View style={styles.miningPill}>
            <View style={styles.miningDot} />
            <Text style={styles.miningText}>Mining</Text>
          </View>
        )}

        {/* Local video */}
        <View style={styles.localVideoContainer}>
          {localStream && !camOff ? (
            <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" zOrder={1} />
          ) : (
            <View style={[styles.localVideo, styles.localVideoOff]}>
              <Text style={{ fontSize: 20 }}>🚫</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {[
            { icon: muted ? '🔇' : '🎤', label: muted ? 'Unmute' : 'Mute', action: toggleMute, active: muted },
            { icon: camOff ? '📵' : '📹', label: camOff ? 'Cam On' : 'Cam Off', action: toggleCamera, active: camOff },
            { icon: '⛏', label: mining ? 'Mining' : 'Mine', action: () => setMining(m => !m), active: mining },
            { icon: '✕', label: 'End', action: endCall, danger: true },
          ].map(btn => (
            <View key={btn.label} style={styles.ctrlItem}>
              <TouchableOpacity onPress={btn.action}
                style={[styles.ctrlBtn, btn.danger && styles.ctrlBtnDanger, btn.active && !btn.danger && styles.ctrlBtnActive]}
                activeOpacity={0.8}>
                <Text style={[styles.ctrlIcon, btn.danger && { color: '#fff' }]}>{btn.icon}</Text>
              </TouchableOpacity>
              <Text style={styles.ctrlLabel}>{btn.label}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero card */}
      <LinearGradient colors={[C.navy, C.blue]} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.heroEmoji}>📹</Text>
        <Text style={styles.heroTitle}>Video Calls</Text>
        <Text style={styles.heroSub}>Earn BHC while on a call</Text>
      </LinearGradient>

      <Text style={styles.contactsLabel}>CONTACTS</Text>

      <FlatList
        data={CONTACTS}
        keyExtractor={i => i.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 30 }}
        renderItem={({ item, index }) => (
          <View style={styles.contactCard}>
            <Avatar name={item.name} size={44} colors={index % 2 === 0 ? [C.blue, C.accent] : [C.navy, C.sky]} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'online' ? C.green : C.muted }]} />
                <Text style={[styles.statusText, { color: item.status === 'online' ? C.green : C.muted }]}>
                  {item.status === 'online' ? 'Online' : 'Away'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => startCall(item)} style={styles.callBtn} activeOpacity={0.8}>
              <LinearGradient colors={[C.blue, C.accent]} style={styles.callBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.callBtnText}>Call</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const C2 = { sky: '#4A90E2' };
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  heroCard: { margin: 16, borderRadius: 18, padding: 22, alignItems: 'center', gap: 6 },
  heroEmoji: { fontSize: 36 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  contactsLabel: { fontSize: 11, fontWeight: '600', color: C.muted, letterSpacing: 0.6, paddingHorizontal: 20, marginBottom: 4 },
  contactCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600', color: C.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11 },
  callBtn: { borderRadius: 10, overflow: 'hidden' },
  callBtnGrad: { paddingHorizontal: 18, paddingVertical: 9 },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  // Call screen
  callContainer: { flex: 1, backgroundColor: C.navy },
  remoteVideo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(26,86,219,0.6)' },
  ring2: { borderColor: 'rgba(26,86,219,0.3)' },
  calleeName: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16 },
  callTimer: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6, fontFamily: 'monospace' },
  miningPill: { position: 'absolute', top: 14, left: 14, backgroundColor: 'rgba(26,86,219,0.85)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  miningDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },
  miningText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  localVideoContainer: { position: 'absolute', bottom: 90, right: 14, width: 80, height: 110, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  localVideo: { width: '100%', height: '100%' },
  localVideoOff: { backgroundColor: '#1a1a2a', alignItems: 'center', justifyContent: 'center' },
  controls: { backgroundColor: C.surface, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border },
  ctrlItem: { alignItems: 'center', gap: 5 },
  ctrlBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  ctrlBtnDanger: { backgroundColor: C.red, borderColor: C.red },
  ctrlBtnActive: { backgroundColor: 'rgba(26,86,219,0.1)', borderColor: C.blue },
  ctrlIcon: { fontSize: 20, color: C.text },
  ctrlLabel: { fontSize: 10, color: C.muted },
});
