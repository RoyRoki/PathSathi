const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^"(.*)"$/, "$1"); // remove quotes
            process.env[key] = value;
        }
    });
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing server-side credentials in .env.local");
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const input = process.argv[2];
const password = process.argv[3]; // Password is required for creation

if (!input) {
    console.log("Usage: node src/scripts/make-admin.js <email_or_uid> [password]");
    process.exit(1);
}

async function makeAdmin(input, password) {
    let user;
    try {
        try {
            if (input.includes("@")) {
                // It's an email
                user = await admin.auth().getUserByEmail(input);
                console.log(`🔍 User found by Email: ${user.email} (UID: ${user.uid})`);
            } else {
                // Assume it's a UID
                user = await admin.auth().getUser(input);
                console.log(`🔍 User found by UID: ${input}`);
            }
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                if (!input.includes("@")) {
                    console.error(`❌ User with UID ${input} not found.`);
                    process.exit(1);
                }
                // If Email, try to create
                if (!password) {
                    console.error(`❌ User ${input} not found and no password provided for creation.`);
                    process.exit(1);
                }
                console.log(`✨ Creating new user ${input}...`);
                try {
                    user = await admin.auth().createUser({
                        email: input,
                        password,
                        emailVerified: true
                    });
                    console.log(`✅ User created (UID: ${user.uid}).`);
                } catch (createError) {
                    console.error("❌ Failed to create user:", createError);
                    process.exit(1);
                }
            } else {
                // Config error or other
                if (!input.includes("@")) {
                    console.warn(`⚠️ Warning: Could not fetch user (${error.code}), but attempting to set claims directly on UID ${input}...`);
                    user = { uid: input, email: "unknown@admin.com" };
                } else {
                    console.error("❌ Error fetching user:", error);
                    process.exit(1);
                }
            }
        }

        // Set Admin Claims
        await admin.auth().setCustomUserClaims(user.uid, { admin: true, role: "admin" });

        // Update Firestore Profile
        const db = admin.firestore();
        const agencyRef = db.collection("agencies").doc(user.uid);
        await agencyRef.set({
            uid: user.uid,
            email: user.email || input,
            name: "Admin User",
            is_verified: true,
            status: "verified",
            role: "admin",
            created_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`🎉 Success! User (UID: ${user.uid}) is now an Admin.`);
        console.log("👉 You can now log in at /admin");
    } catch (error) {
        if (error.code === 5) {
            console.warn("⚠️ Warning: Admin Claim SET, but Firestore write failed (Code 5: NOT_FOUND).");
        } else {
            console.error("❌ Final Error:", error);
        }
        process.exit(1);
    }
}

makeAdmin(input, password);
