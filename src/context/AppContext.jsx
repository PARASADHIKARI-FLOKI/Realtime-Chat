import { createContext, useEffect, useState } from "react";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../config/firebas";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);

    const loadUserData = async (uid) => {
        if (!uid) return;

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                setUserData(userData);

                if (userData.avatar && userData.name) {
                    navigate("/chat");
                } else {
                    navigate("/profile");
                }

                await updateDoc(userRef, { lastSeen: Date.now() });

                setInterval(async () => {
                    if (auth.currentUser) {
                        await updateDoc(userRef, { lastSeen: Date.now() });
                    }
                }, 60000);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    useEffect(() => {
        if (userData?.id) {
            const chatRef = doc(db, "chats", userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatItems = res.data()?.chatsData || [];
                const tempData = [];

                for (const item of chatItems) {
                    try {
                        const userRef = doc(db, "users", item.rId);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            tempData.push({ ...item, userData: userSnap.data() });
                        }
                    } catch (error) {
                        console.error("Error fetching chat user:", error);
                    }
                }

                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            });

            return () => unSub();
        }
    }, [userData]);

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
