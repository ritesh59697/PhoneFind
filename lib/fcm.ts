import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// You'll generate this JSON file from Firebase Console:
// Project settings -> Service accounts -> Generate new private key.
// Store its contents in an env var (FIREBASE_SERVICE_ACCOUNT_JSON) rather
// than committing the file — it grants full send access to your project.
function getFirebaseApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Add it to your .env.local " +
        "once you've created a Firebase project and generated a service account key."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export async function sendCommandPush(params: {
  fcmToken: string;
  commandId: string;
  type: "lock" | "locate" | "alarm" | "wipe";
}) {
  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  // data-only message (no "notification" field) so the phone can handle
  // this silently in the background without showing a system notification
  // that would tip off whoever has the phone.
  return messaging.send({
    token: params.fcmToken,
    data: {
      commandId: params.commandId,
      type: params.type,
    },
    android: {
      priority: "high",
    },
  });
}
