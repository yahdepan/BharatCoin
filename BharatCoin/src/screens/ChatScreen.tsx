import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useApp } from '../context/AppContext';

const C = {
  bg: '#F0F4FF', surface: '#FFFFFF', navy: '#0D1B4B',
  blue: '#1A56DB', accent: '#00C2FF', sky: '#4A90E2',
  border: '#D6E0FF', muted: '#8A9BBF', green: '#10B981',
  red: '#EF4444', text: '#0D1B4B',
};

function Avatar({ name, size = 36 }) {
  const colors = ['#1A56DB', '#0D1B4B', '#4A90E2', '#00C2FF'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{name[0].toUpperCase()}</Text>
    </View>
  );
}

function MessageBubble({ msg }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }).start();
  }, []);

  return (
    <Animated.View style={[styles.msgRow, msg.mine && styles.msgRowMine, { opacity: anim, transform: [{ scale: anim }] }]}>
      {!msg.mine && <Avatar name={msg.from} size={32} />}
      <View style={{ maxWidth: '72%' }}>
        {!msg.mine && <Text style={styles.msgFrom}>{msg.from}</Text>}
        <View style={[styles.bubble, msg.mine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, msg.mine && styles.bubbleTextMine]}>{msg.text}</Text>
        </View>
        <Text style={[styles.msgTime, msg.mine && styles.msgTimeMine]}>
          {msg.time}{msg.queued ? ' · queued' : ''}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { messages, sendMessage, isOnline, offlineQueue } = useApp();
  const [input, setInput] = useState('');
  const flatRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    if (!isOnline) {
      Toast.show({ type: 'info', text1: 'Queued for delivery 📴', text2: 'Will send when back online', visibilityTime: 2000 });
    } else {
      Toast.show({ type: 'success', text1: 'Message sent ✓', visibilityTime: 1500 });
    }
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            📴 Offline mode — {offlineQueue.length} message{offlineQueue.length !== 1 ? 's' : ''} queued
          </Text>
        </View>
      )}

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={C.muted}
          style={styles.input}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendBtn} activeOpacity={0.8}>
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  offlineBanner: { backgroundColor: 'rgba(239,68,68,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(239,68,68,0.2)', paddingVertical: 8, paddingHorizontal: 16 },
  offlineText: { fontSize: 12, color: C.red, textAlign: 'center', fontWeight: '500' },
  list: { padding: 14, paddingBottom: 8, gap: 12 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  msgRowMine: { justifyContent: 'flex-end' },
  msgFrom: { fontSize: 11, color: C.blue, fontWeight: '600', marginBottom: 3 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: C.blue, borderTopRightRadius: 4 },
  bubbleOther: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderTopLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: C.text, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  msgTime: { fontSize: 10, color: C.muted, marginTop: 3 },
  msgTimeMine: { textAlign: 'right' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.text, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', shadowColor: C.blue, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  sendIcon: { color: '#fff', fontSize: 16 },
});
