import * as admin from 'firebase-admin';

export async function checkAndIncrementUsage(uid: string): Promise<{ allowed: boolean; remaining: number }> {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const usageRef = admin.database().ref(`users/${uid}/aiUsage/${date}`);
  
  const snapshot = await usageRef.get();
  const currentUsage = snapshot.val() || 0;
  const LIMIT = 3;

  if (currentUsage >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  const newUsage = currentUsage + 1;
  await usageRef.set(newUsage);
  
  return { allowed: true, remaining: LIMIT - newUsage };
}
