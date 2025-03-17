import React, { useContext, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebas";
import { AppContext } from "../../context/AppContext";
import { IoPersonCircle } from "react-icons/io5";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, setChatUser, setMessagesId } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  console.log("Chat Data:", chatData);

  const safeChatData = Array.isArray(chatData) ? chatData : [];

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim();
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const searchedUser = querySnap.docs[0].data();
          if (searchedUser.id !== userData.id) {
            const userExist = safeChatData.some((u) => u.rId === searchedUser.id);
            if (!userExist) {
              setUser(searchedUser);
            }
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error in inputHandler:", error);
    }
  };

  const addChat = async () => {
    if (!user) return;

    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      const newMessageRef = doc(messagesRef);

      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatDataForCurrentUser = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: { name: user.name, id: user.id },
      };

      const chatDataForReceiver = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: false,
        userData: { name: userData.name, id: userData.id },
      };

      await updateDoc(doc(chatsRef, user.id), {
        chatsData: arrayUnion(chatDataForReceiver),
      });

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion(chatDataForCurrentUser),
      });

      toast.success("Chat added successfully!");
      setUser(null);
      setShowSearch(false);
    } catch (error) {
      toast.error("Failed to add chat: " + error.message);
      console.error(error);
    }
  };

  const setChat = (item) => {
    setMessagesId(item.messageId);
    setChatUser({
      ...item,
      userData: item.userData || { name: "Unknown User", id: item.rId },
    });
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search" />
          <input onChange={inputHandler} type="text" placeholder="Search here.." />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="frienduser">
            <p>{user.name}</p>
          </div>
        ) : safeChatData.length > 0 ? (
          safeChatData.map((item, index) => (
            <div onClick={() => setChat(item)} key={index} className="friends">
              <IoPersonCircle size={28} />
              <div>
                <p>{item?.userData?.name || "Unknown User"}</p>
                <span>{item?.lastMessage || "No messages yet"}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-chats">No chats available</p>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
