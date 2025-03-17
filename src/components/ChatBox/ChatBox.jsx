import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { IoPersonCircle } from "react-icons/io5";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebas";
import { toast } from "react-toastify";
import moment from "moment"; 

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(), 
          }),
        });

        const userIDs = [chatUser.rId, userData.id];
        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });

      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className="chat-box">
      <div className="chat-user">
        <IoPersonCircle size={28} />
        <p>{chatUser.userData?.name || "Unknown User"}<img src={assets.green_dot} className='dot' alt="Online" /></p>
      </div>
      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            <p className="msg">{msg.text}</p>
            <span className="timestamp">
              {msg.createdAt ? moment(msg.createdAt.toDate()).format("hh:mm A") : "Just now"}
            </span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Send a message" />
        <img onClick={sendMessage} src={assets.send_button} alt="Send" />
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
