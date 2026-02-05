const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing admin env vars. Set FIREBASE_ADMIN_*.");
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({
        credential: cert({ projectId, clientEmail, privateKey })
    });
}

const db = getFirestore();

const routes = require("../src/data/routes/routes.json");

async function seed() {
    const batch = db.batch();

    for (const route of routes) {
        const ref = db.collection("routes").doc(route.slug);
        batch.set(ref, { ...route, createdAt: new Date() }, { merge: true });
    }

    await batch.commit();
    console.log(`Seeded ${routes.length} routes.`);
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
