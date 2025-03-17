import React, { useContext, useEffect, useState } from 'react';
import "./ProfileUpdate.css";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebas';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import assets from '../../assets/assets'; // Default avatar if none exists

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const { setUserData } = useContext(AppContext);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(""); 
  const [uid, setUid] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setAvatar(data.avatar || assets.avatar_icon); 
        }
      } else {
        navigate('/');
      }
    });
  }, [navigate]);

  const profileUpdate = async (event) => {
    event.preventDefault();

    try {
      const docRef = doc(db, 'users', uid);

      // Update Firestore with name and bio only (No image update)
      await updateDoc(docRef, { bio, name });

      // Fetch updated user data and update context
      const snap = await getDoc(docRef);
      setUserData(snap.data());

      toast.success("Profile updated successfully!");

    
      setTimeout(() => {
        navigate('/chat');
      }, 500);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profile update failed");
    }
  };

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <div className="avatar-container">
            <img src={avatar} alt="Profile Avatar" className="profile-avatar" />
          </div>
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            type="text" 
            placeholder='Your name' 
            required 
          />
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            placeholder='Write profile bio' 
            required
          />
          <button type='submit'>Save</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
