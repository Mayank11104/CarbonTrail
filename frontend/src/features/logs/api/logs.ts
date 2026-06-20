import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import type { LogCategory } from '../components/LogModal';

export interface CarbonLog {
  id?: string;
  category: LogCategory;
  option: string;
  amount: number;
  carbonImpact: number;
  timestamp: Date;
}

// Carbon emission multipliers (kg CO2)
const estimateCarbon = (category: LogCategory, option: string, amount: number): number => {
  let multiplier = 0;

  if (category === 'transport') {
    if (option === 'Car') multiplier = 0.24;
    if (option === 'Bus') multiplier = 0.08;
    if (option === 'Metro') multiplier = 0.04;
    if (option === 'Walk/Bike') multiplier = 0;
  } else if (category === 'food') {
    if (option === 'Beef/Lamb') multiplier = 5.0;
    if (option === 'Chicken/Pork') multiplier = 1.5;
    if (option === 'Vegetarian') multiplier = 0.8;
    if (option === 'Vegan') multiplier = 0.4;
  } else if (category === 'energy') {
    if (option === 'AC (Hours)') multiplier = 0.9;
    if (option === 'Heater (Hours)') multiplier = 1.2;
    if (option === 'General Usage') multiplier = 0.5;
  } else if (category === 'shopping') {
    if (option === 'Electronics') multiplier = 15.0;
    if (option === 'Clothing') multiplier = 5.0;
    if (option === 'Home Goods') multiplier = 3.0;
    if (option === 'Other') multiplier = 2.0;
  }

  return Number((amount * multiplier).toFixed(2));
};

export const saveLog = async (
  userId: string,
  category: LogCategory,
  option: string,
  amount: number
) => {
  if (!category) return null;

  const logsRef = collection(db, `users/${userId}/logs`);
  const carbonImpact = estimateCarbon(category, option, amount);

  const newLog = {
    category,
    option,
    amount,
    carbonImpact,
    timestamp: Timestamp.now(),
  };

  const docRef = await addDoc(logsRef, newLog);
  return { id: docRef.id, ...newLog };
};

export const saveScannedLog = async (
  userId: string,
  category: LogCategory,
  option: string,
  amount: number,
  carbonImpact: number
) => {
  if (!category) return null;

  const logsRef = collection(db, `users/${userId}/logs`);

  const newLog = {
    category,
    option,
    amount,
    carbonImpact,
    timestamp: Timestamp.now(),
  };

  const docRef = await addDoc(logsRef, newLog);
  return { id: docRef.id, ...newLog };
};


/**
 * Subscribe to today's logs. Calls callback with the full CarbonLog[].
 * Dashboard computes totals/percentages from the array itself.
 */
export const subscribeToDailyLogs = (
  userId: string,
  callback: (logs: CarbonLog[]) => void
) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const logsRef = collection(db, `users/${userId}/logs`);
  const q = query(
    logsRef,
    where('timestamp', '>=', Timestamp.fromDate(startOfToday))
  );

  return onSnapshot(q, (snapshot) => {
    const logs: CarbonLog[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category as LogCategory,
        option: data.option,
        amount: data.amount,
        carbonImpact: data.carbonImpact,
        timestamp: data.timestamp.toDate(),
      };
    });
    callback(logs);
  });
};

/**
 * Subscribe to the user's current streak.
 * Counts consecutive days (ending today) that have at least one log entry.
 */
export const subscribeToStreak = (
  userId: string,
  callback: (streak: number) => void
) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsRef = collection(db, `users/${userId}/logs`);
  const q = query(
    logsRef,
    where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
  );

  return onSnapshot(q, (snapshot) => {
    // Build a Set of day strings like "2026-06-20" that have logs
    const daysWithLogs = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const ts: Date = doc.data().timestamp.toDate();
      const key = ts.toISOString().slice(0, 10); // "YYYY-MM-DD"
      daysWithLogs.add(key);
    });

    // Count consecutive days backwards from today
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (daysWithLogs.has(key)) {
        streak++;
      } else {
        break; // streak broken
      }
    }

    callback(streak);
  });
};

export const subscribeToWeeklyLogs = (
  userId: string,
  callback: (logs: CarbonLog[]) => void
) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const logsRef = collection(db, `users/${userId}/logs`);
  const q = query(
    logsRef,
    where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
  );

  return onSnapshot(q, (snapshot) => {
    const logs: CarbonLog[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category as LogCategory,
        option: data.option,
        amount: data.amount,
        carbonImpact: data.carbonImpact,
        timestamp: data.timestamp.toDate(),
      };
    });
    callback(logs);
  });
};

