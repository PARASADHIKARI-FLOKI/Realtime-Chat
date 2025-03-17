import { initializeApp } from "firebase/app";
import { 
  createUserWithEmailAndPassword, 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJfUU-IXMA7yvMphO4fLCgsi8RcTIEXYA",
  authDomain: "chat-app11212.firebaseapp.com",
  projectId: "chat-app11212",
  storageBucket: "chat-app11212.appspot.com",
  messagingSenderId: "501135027412",
  appId: "1:501135027412:web:58d77356edbc5fc066df41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Signup function
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using chat app",
      lastSeen: Date.now()
    });

    await setDoc(doc(db, "chats", user.uid), {
      chatsData: []
    });

  } catch (error) {
    console.error(error);
    toast.error(error.code ? error.code.split('/')[1].replace(/-/g, " ") : "Signup failed");
  }
};

// Login function
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code ? error.code.split('/')[1].replace(/-/g, " ") : "Login failed");
  }
};

// Logout function
const logout = async () => {
  try {
    await signOut(auth);
    toast.success("Logout successful!");
  } catch (error) {
    console.error(error);
    toast.error(error.code ? error.code.split('/')[1].replace(/-/g, " ") : "Logout failed");
  }
};

export { signup, login, logout, auth, db, storage };
