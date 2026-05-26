import { NextResponse } from "next/server";
import admin from "firebase-admin";

const initAdmin = () => {
  if (admin.apps.length > 0) return true;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      // Handle escaped newlines in env variables
      const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
      return true;
    } catch (e) {
      console.error("Failed to initialize Firebase Admin SDK:", e);
      return false;
    }
  } else {
    console.warn("Firebase Admin environment variables are missing. Auth sync is skipped.");
    return false;
  }
};

export async function POST(req: Request) {
  try {
    const isSdkReady = initAdmin();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado. Token faltante." }, { status: 401 });
    }

    if (!isSdkReady) {
      return NextResponse.json({
        error: "Firebase Admin SDK no está configurado. Por favor, agregue las credenciales del Service Account en .env.local para sincronizar con Firebase Auth.",
        code: "admin-sdk-missing"
      }, { status: 501 });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Token de autenticación inválido o expirado." }, { status: 401 });
    }

    const adminEmail = decodedToken.email;
    if (!adminEmail) {
      return NextResponse.json({ error: "El token no contiene un correo electrónico." }, { status: 401 });
    }

    // Verify if the requester is in the admins collection or is the owner
    const db = admin.firestore();
    const adminDoc = await db.collection("admins").doc(adminEmail.toLowerCase()).get();
    const isOwner = adminEmail.toLowerCase() === "facundorodriguezsp@gmail.com";

    if (!adminDoc.exists && !isOwner) {
      return NextResponse.json({ error: "No tienes permisos de administrador." }, { status: 403 });
    }

    const body = await req.json();
    const { uid, email, password, displayName, status } = body;

    if (!uid) {
      return NextResponse.json({ error: "UID del usuario requerido." }, { status: 400 });
    }

    // Prepare Auth update data
    const authUpdate: any = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;
    if (displayName) authUpdate.displayName = displayName;
    if (status) {
      authUpdate.disabled = status === "deactivated";
    }

    // Update in Firebase Auth
    await admin.auth().updateUser(uid, authUpdate);

    // Update in Firestore users collection
    const userRef = db.collection("users").doc(uid);
    const firestoreUpdate: any = {};
    if (email) firestoreUpdate.email = email;
    if (displayName) firestoreUpdate.displayName = displayName;
    if (status) firestoreUpdate.status = status;
    if (password) firestoreUpdate.password = password; // Save plaintext password for recovery as requested

    await userRef.set(firestoreUpdate, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating user in Firebase Admin:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar el usuario." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isSdkReady = initAdmin();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    if (!isSdkReady) {
      return NextResponse.json({
        error: "Firebase Admin SDK no está configurado.",
        code: "admin-sdk-missing"
      }, { status: 501 });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const adminEmail = decodedToken.email;
    if (!adminEmail) {
      return NextResponse.json({ error: "El token no contiene un correo electrónico." }, { status: 401 });
    }
    const db = admin.firestore();
    const adminDoc = await db.collection("admins").doc(adminEmail.toLowerCase()).get();
    const isOwner = adminEmail.toLowerCase() === "facundorodriguezsp@gmail.com";

    if (!adminDoc.exists && !isOwner) {
      return NextResponse.json({ error: "No tienes permisos de administrador." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json({ error: "UID del usuario requerido." }, { status: 400 });
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    // Save to deleted_users list so active client sessions get closed immediately via syncUserProfile
    await db.collection("deleted_users").doc(uid).set({
      deletedAt: new Date().toISOString(),
    });

    // Delete from Firestore
    await db.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user in Firebase Admin:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar el usuario." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const isSdkReady = initAdmin();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    if (!isSdkReady) {
      return NextResponse.json({
        error: "Firebase Admin SDK no está configurado.",
        code: "admin-sdk-missing"
      }, { status: 501 });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Token inválido o expirado." }, { status: 401 });
    }

    const adminEmail = decodedToken.email;
    if (!adminEmail) {
      return NextResponse.json({ error: "El token no contiene un correo electrónico." }, { status: 401 });
    }

    const db = admin.firestore();
    const adminDoc = await db.collection("admins").doc(adminEmail.toLowerCase()).get();
    const isOwner = adminEmail.toLowerCase() === "facundorodriguezsp@gmail.com";

    if (!adminDoc.exists && !isOwner) {
      return NextResponse.json({ error: "No tienes permisos de administrador." }, { status: 403 });
    }

    // List all users from Firebase Auth (up to 1000)
    const listUsersResult = await admin.auth().listUsers(1000);
    const authUsers = listUsersResult.users.map(u => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      disabled: u.disabled,
      createdAt: u.metadata.creationTime,
      lastLoginAt: u.metadata.lastSignInTime,
      providerId: u.providerData[0]?.providerId || "unknown"
    }));

    return NextResponse.json({ users: authUsers });
  } catch (error: any) {
    console.error("Error listing users in Firebase Admin:", error);
    return NextResponse.json({ error: error.message || "Error al listar usuarios." }, { status: 500 });
  }
}

