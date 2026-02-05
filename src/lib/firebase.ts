"use client";

import type { FirebaseApp } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { getAuth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

type FirebaseServices = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let cached: FirebaseServices | null = null;

function initFirebase(): FirebaseServices {
  if (cached) return cached;

  if (!firebaseConfig.apiKey) {
    // Skip initialization when env vars are missing (use mock data fallback).
    if (typeof window !== "undefined") {
      console.warn("Firebase client env vars are missing. Using fallback data.");
    }
    cached = { app: null, auth: null, firestore: null, storage: null };
    return cached;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cached = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app)
  };
  return cached;
}

export function getFirebaseServices() {
  return initFirebase();
}

export function getFirebaseAuth() {
  return initFirebase().auth;
}

export function getFirestoreDb() {
  return initFirebase().firestore;
}

export function getFirebaseStorage() {
  return initFirebase().storage;
}
