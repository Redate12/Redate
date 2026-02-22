import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { chatService } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();

    // Setup real-time listener using Firebase Firestore
    // This would be implemented with Firebase SDK

    return () => {
      // Cleanup listener
    };
  }, [matchId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await chatService.getMessages(matchId, { limit: 50 });
      setMessages(response.data.messages || []);
      scrollToBottom(false);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      setSending(true);
      const text = inputText.trim();
      setInputText('');

      // Send message to backend
      await chatService.sendMessage(matchId, text, 'text');

      // Also send to Firebase Firestore for real-time
      // This would use Firebase SDK

      Keyboard.dismiss();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = (animated = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === 'currentUserId'; // Replace with actual user ID
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageSent : styles.messageReceived,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMe ? styles.messageTextSent : styles.messageTextReceived,
          ]}
        >
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollToBottom(false)}
        onLayout={() => scrollToBottom(false)}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '...' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  messageSent: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  messageReceived: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextSent: {
    color: COLORS.text,
  },
  messageTextReceived: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});