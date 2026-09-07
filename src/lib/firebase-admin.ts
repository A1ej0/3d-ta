import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Firebase Admin SDK — Only for use in API Routes (server-side)
// Uses Application Default Credentials or environment variables.

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If we have a service account JSON, use it
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
    }
  }

  // Fallback: use project ID only (works in Google Cloud environments)
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const adminApp = getAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
