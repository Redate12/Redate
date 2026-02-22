import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {db} from '../config/firebaseConfig';
import {getCurrentUserId} from './AuthService';

// Send message via Firebase (real-time)
export const sendMessageToFirebase = async (matchId, senderId, content, type = 'text') => {
  try {
    const messagesRef = collection(db, 'matches', matchId, 'messages');

    await addDoc(messagesRef, {
      senderId,
      content,
      type,
      timestamp: serverTimestamp(),
      read: false,
    });

    return {success: true};
  } catch (error) {
    console.error('Error sending message to Firebase:', error);
    return {success: false, error: error.message};
  }
};

// Listen to messages for a match (real-time)
export const listenToMessages = (matchId, callback) => {
  const messagesRef = collection(db, 'matches', matchId, 'messages');

  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now(),
    }));
    callback(messages);
  });

  return unsubscribe;
};

// Mark messages as read
export const markMessagesAsRead = async (matchId) => {
  try {
    const userId = getCurrentUserId();

    const messagesRef = collection(db, 'matches', matchId, 'messages');
    const q = query(messagesRef, where('senderId', '!=', userId), where('read', '==', true));

    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map((docRef) =>
      updateDoc(docRef.ref, {read: true}),
    );

    await Promise.all(updatePromises);

    return {success: true};
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return {success: false, error: error.message};
  }
};

// Get match info from Firebase
export const getMatchFromFirebase = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);

    if (matchSnap.exists()) {
      return {success: true, data: matchSnap.data()};
    }

    return {success: false, error: 'Match not found'};
  } catch (error) {
    console.error('Error getting match:', error);
    return {success: false, error: error.message};
  }
};

// Update match activity
export const updateMatchActivity = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);

    await updateDoc(matchRef, {
      lastActivity: serverTimestamp(),
    });

    return {success: true};
  } catch (error) {
    console.error('Error updating match activity:', error);
    return {success: false, error: error.message};
  }
};

// Check if match exists in Firebase, create if not
export const ensureMatchExists = async (matchData) => {
  try {
    const matchRef = doc(db, 'matches', matchData.id);

    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      await setDoc(matchRef, {
        ...matchData,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });
    }

    return {success: true};
  } catch (error) {
    console.error('Error ensuring match exists:', error);
    return {success: false, error: error.message};
  }
};

export default {
  sendMessageToFirebase,
  listenToMessages,
  markMessagesAsRead,
  getMatchFromFirebase,
  updateMatchActivity,
  ensureMatchExists,
};