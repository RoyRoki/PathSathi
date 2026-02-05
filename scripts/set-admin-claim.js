const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const adminEmail = process.env.ADMIN_EMAIL;

if (!projectId || !clientEmail || !privateKey || !adminEmail) {
  console.error("Missing admin env vars. Set FIREBASE_ADMIN_* and ADMIN_EMAIL.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  });
}

const auth = getAuth();

async function run() {
  const user = await auth.getUserByEmail(adminEmail);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim set for ${adminEmail}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
