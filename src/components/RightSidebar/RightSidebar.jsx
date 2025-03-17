import React, { useContext } from 'react';
import "./RightSidebar.css";
import assets from '../../assets/assets';
import { logout } from '../../config/firebas';
import { IoPersonCircle } from "react-icons/io5";
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { userData } = useContext(AppContext); // Get user data from context

  return (
    <div className='rs'>
      <div className="rs-profile">
        <IoPersonCircle size={180} />
        <h3>
          {userData?.name || "User Name"} 
          <img src={assets.green_dot} className='dot' alt="Online" />
        </h3>
        <p>{userData?.bio || "Hey there! I'm using this chat app."}</p>
      </div>
      <hr />
      <div className="rs-media">
       
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RightSidebar;
