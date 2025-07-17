import React, {useContext} from "react";
import { FaUser} from "react-icons/fa";
import "../styles/sidebarStyle.css";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  handleLogout
}) => {
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const { userName, userRole, clearAuth } = useContext(AuthContext); 

  return (
    <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {sidebarOpen && (
          <>
             <button className="sidebar-main">
              <img alt="profile" class="profile-image" src="/static/media/woman (1).f68a0bacd9751b092b0b.png"></img>
        {userName}
      </button>
          </>
        )}
      </div>

      {/* Navigation Area */}
      <div className="sidebar-nav">
        {/* Add more navigation links here */}
      </div>

      {/* Profile Section */}
      <div className="sidebar-profile">
        {sidebarOpen && (
          <div className="profile-info">
          </div>
        )}
      </div>

      {/* Logout Button */}
       <button className="logout-button" onClick={handleLogout}>
        <svg stroke="#7a0000" fill="#7a0000" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
        {sidebarOpen && "Logout"}
      </button>
    </div>
  );
};

export default Sidebar;
