import { database } from '../firebase';
import { ref, get } from 'firebase/database';

export const testFirebaseConnection = async () => {
  if (!database) {
    console.error('Database object is null');
    return;
  }
  try {
    const r = ref(database, '/');
    const snapshot = await get(r);
    console.log('Firebase connection test successful:', snapshot.exists());
  } catch (e) {
    console.error('Firebase connection test failed:', e);
  }
};
