import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../styles/topbarStyle.css";
import axios from "../../src/api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import profileImg from "../assets/woman (1).png";
import balanceIcon from "../assets/brifcase.png";
import flag from "../assets/red-flag (2).png";
import notificationIcon from "../assets/bells.png";
import chatIcon from "../assets/chat.png";
import minimize from "../assets/exit-full-screen.png";
import maximize from "../assets/maximize.png";
import menuOpenIcon from "../assets/back.png";
import menuCloseIcon from "../assets/shift.png";
import { getPatternCells  } from "../../src/utils/patternUtils";

const patternOptions = [
  "select winning pattern",
  "any vertical",
  "any horizontal",
  "any 2 vertical",
  "any 2 horizontal",
  "any diagonal",
  "any 1 Corner Square",
  "any 2 Corner Square",
  "any 3 Corner Square",
  "any 4 Corner Square",
  "any 2 line",
  "any 3 line",
  "all 4 Corner Square (single)",
  "any line",
  "4 single Middle",
  "4 inner & 4 outer",
  "all 4 corner square(single) and any line",
];

const Topbar = forwardRef(({ isCollapsed, sidebarOpen, setSidebarOpen }, ref) => {
  const [balance, setBalance] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sentTransactions, setSentTransactions] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showPatternDropdown, setShowPatternDropdown] = useState(false);
  const [useAndLogic, setUseAndLogic] = useState(() => {
    const stored = localStorage.getItem("bingoUseAndLogic");
    return stored ? JSON.parse(stored) : false;
  });

  const notificationsRef = useRef();
  const profileRef = useRef();
  const { userName, userRole, clearAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const unreadCount = notifications.length;

  const [selectedPatterns, setSelectedPatterns] = useState(() => {
    const stored = localStorage.getItem("bingoSelectedPatterns");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("bingoSelectedPatterns", JSON.stringify(selectedPatterns));
  }, [selectedPatterns]);

  useEffect(() => {
    localStorage.setItem("bingoUseAndLogic", JSON.stringify(useAndLogic));
  }, [useAndLogic]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
    clearAuth();
    navigate("/");
  };

  const fetchBalance = useCallback(async () => {
    const endpoint =
      userRole === "support"
        ? "/auth/support/profile"
        : userRole === "founder"
        ? "/auth/founder/profile"
        : null;
    if (!endpoint) return;

    try {
      const res = await axios.get(endpoint, { withCredentials: true });
      setBalance(res.data.balance ?? 0);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, [userRole]);

  const fetchNotifications = useCallback(async () => {
    let endpoint = null;
    if (userRole === "support") endpoint = "/auth/support/notifications";
    else if (userRole === "founder") endpoint = "/auth/founder/notifications";
    if (!endpoint) return;

    try {
      const res = await axios.get(endpoint, { withCredentials: true });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [userRole]);

  const fetchSentTransactions = useCallback(async () => {
    if (userRole !== "founder") return;
    try {
      const res = await axios.get("/founder/transactions", {
        params: { page: 1, limit: 35 },
        withCredentials: true,
      });
      setSentTransactions(res.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch sent transactions:", err);
    }
  }, [userRole]);

  const markAsRead = async (id) => {
    const role = userRole === "founder" ? "founder" : "support";
    try {
      await axios.patch(`/auth/${role}/notifications/${id}`, {}, { withCredentials: true });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchBalance,
    getBalance: () => balance,
    getSelectedPatterns: () => selectedPatterns,
    getUseAndLogic: () => useAndLogic,
  }));

  useEffect(() => {
    if (!userRole) return;

    fetchBalance();
    fetchNotifications();
    fetchSentTransactions();

    const interval = setInterval(() => {
      fetchBalance();
      fetchNotifications();
      fetchSentTransactions();
    }, 10000);

    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (
        e.target.closest(".flag-dropdown") === null &&
        e.target.closest(".flag-overlay") === null &&
        !e.target.classList.contains("flag-dropdown-toggle")
      ) {
        setShowPatternDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userRole, fetchBalance, fetchNotifications, fetchSentTransactions]);

  return (
    <>
      {showPatternDropdown && (
        <div className="flag-overlay" onClick={() => setShowPatternDropdown(false)} />
      )}

      <div className={`topbar ${isCollapsed ? "topbar-collapsed" : ""}`}>
        <div className="topbar-left">
          <button className="topbar-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <img
              src={sidebarOpen ? menuCloseIcon : menuOpenIcon}
              alt="Menu"
              className="menu-icon-img"
            />
          </button>
        </div>

        <div className="topbar-right">
          {/* Profile */}
          <div className="dropdown-container" ref={profileRef}>
            <button className="topbar-button" onClick={() => setShowProfile(!showProfile)}>
              <div className="profile-dot-container">
                <img src={profileImg} alt="profile" className="profile-image-small" />
                <span className="online-indicator" />
              </div>
            </button>
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-image-container">
                  <img src={profileImg} alt="profile" className="profile-image" />
                </div>
                <div className="profile-info">{userName || "Company"}</div>
                <button className="dropdown-button" onClick={handleLogout} disabled={loggingOut}>
                  {loggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          <button className="topbar-button" onClick={toggleFullscreen} title="Toggle Fullscreen">
            <img src={isFullscreen ? minimize : maximize} alt="Fullscreen" className="icon-img" />
          </button>

          {/* Balance */}
          <div className="balance-container">
            <button className="topbar-button balance-button">
              <img src={balanceIcon} alt="Balance" className="icon-img" />
              <div className="balance-tooltip">
                ያልዎት ቀሪ ሂሳብ<br />
                {balance !== null ? `${parseFloat(balance).toFixed(1)} ብር` : "በመጫን ላይ..."}
              </div>
            </button>
          </div>

          {/* Notifications */}
          {userRole === "support" && (
            <div className="dropdown-container" ref={notificationsRef}>
              <button className="topbar-button" onClick={() => setShowNotifications(!showNotifications)}>
                <img src={notificationIcon} alt="Notifications" className="icon-img" />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown">
                  <h4>Notifications</h4>
                  {notifications.length === 0 ? (
                    <h4>No notifications</h4>
                  ) : (
                    notifications.map((notif, index) => (
                      <div key={index} className="notification-item">
                        <div className="notif-content">
                          <img src={chatIcon} alt="chat" />
                          <div>
                            <strong className="notification-title">Balance Received</strong>
                            <div className="notification-text">
                              You received <strong className="notification-title">{notif.amount} ብር</strong> from 09--------{notif.senderEmail}
                            </div>
                            <small>{notif.time}</small>
                            <button className="mark-read" onClick={() => markAsRead(notif._id)}>
                              Mark as read
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sent Transactions */}
          {userRole === "founder" && (
            <div className="dropdown-container">
              <button className="topbar-button" onClick={() => setShowSent(!showSent)}>
                <img src={notificationIcon} alt="Notifications" className="icon-img" />
              </button>
              {showSent && (
                <div className="notification-dropdown">
                  <h4>Sent Transactions</h4>
                  {sentTransactions.length === 0 ? (
                    <p className="notification-subtitle">No records</p>
                  ) : (
                    sentTransactions.map((tx, index) => (
                      <div key={index} className="notification-item">
                        <div className="notif-content">
                          <img src={chatIcon} alt="sent" />
                          <div className="notification-text">
                            <strong className="notification-title">Sent {tx.amount} ብር</strong> to <strong className="notification-title">{tx.receiverEmail}</strong>
                            <small>{new Date(tx.createdAt).toLocaleString()}</small>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Flag Pattern Dropdown */}
          <div className="dropdown-container">
            <button
              className="topbar-button flag-dropdown-toggle"
              onClick={() => setShowPatternDropdown(!showPatternDropdown)}
            >
              <img src={flag} alt="Pattern" className="icon-img" />
            </button>
            {showPatternDropdown && (
              <div className="flag-dropdown">
                <h4>Select Pattern</h4>

                <div className="pattern-list">
                  {patternOptions.map((pattern, idx) => {
                    if (pattern === "select winning pattern") return null;

                    const isSelected = selectedPatterns.includes(pattern);

                    return (
                      <div
                        key={idx}
                        className={`pattern-option ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedPatterns((prev) =>
                            prev.includes(pattern)
                              ? prev.filter((p) => p !== pattern)
                              : [...prev, pattern]
                          );
                        }}
                      >
                        {pattern}
                      </div>
                    );
                  })}
                </div>

                <div className="and-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={useAndLogic}
                      onChange={(e) => setUseAndLogic(e.target.checked)}
                    />
                    Require All Selected Patterns (AND)
                  </label>
                </div>

                <button className="clear-button" onClick={() => setSelectedPatterns([])}>
                  Clear Pattern
                </button>

<div className="preview-grid">
  {[...Array(25)].map((_, idx) => {
    const isRed = selectedPatterns.some((pattern) => {
      if (pattern === "any vertical") {
        // Highlight center column (column index 2)
        return [2, 7, 12, 17, 22].includes(idx);
      } else if (pattern === "any horizontal") {
        // Highlight center row (row index 2)
        return [10, 11, 12, 13, 14].includes(idx);
        } else if (pattern === "any 2 horizontal") {
        // Highlight center row (row index 2)
        return [5, 6, 7, 8, 9, 15, 16, 17, 18, 19].includes(idx);
      } else if (pattern === "any 2 vertical") {
        // Highlight center row (row index 2)
        return [1, 6, 11, 16, 21, 3, 8, 13, 18, 23].includes(idx);
        } else if (pattern === "any diagonal") {
        // Highlight center row (row index 2)
        return [0, 6, 12, 18, 24].includes(idx) || [4, 8, 12, 16, 20].includes(idx);
        } else if (pattern === "any 1 Corner Square") {
        // Highlight center row (row index 2)
        return [0, 5, 1, 6].includes(idx);
        } else if (pattern === "any 2 Corner Square") {
        // Highlight center row (row index 2)
        return [0, 5, 1, 6, 18, 19, 23, 24].includes(idx);
        } else if (pattern === "any 3 Corner Square") {
        // Highlight center row (row index 2)
        return [0, 5, 1, 6, 18, 19, 23, 24, 20, 15, 16, 21].includes(idx);
        } else if (pattern === "any 4 Corner Square") {
        // Highlight center row (row index 2)
        return [0, 5, 1, 6, 18, 19, 23, 24, 20, 15, 16, 21, 4, 9, 8, 3].includes(idx);
        } else if (pattern === "any 2 line") {
        // Highlight center row (row index 2)
        return [10, 11, 12, 13, 14, 2, 7, 12, 17, 22, 0, 6, 12, 18, 24, 4, 8, 12, 16, 20].includes(idx);
        } else if (pattern === "any 3 line") {
        // Highlight center row (row index 2)
        return [0, 5, 10, 15, 20, 24, 20, 21, 22, 23, 0, 6, 12, 18, 24].includes(idx);
        } else if (pattern === "all 4 Corner Square (single)") {
        // Highlight center row (row index 2)
        return [0, 24, 20, 4].includes(idx);
        } else if (pattern === "any line") {
        // Highlight center row (row index 2)
        return [10, 11, 12, 13, 14, 2, 7, 12, 17, 22, 0, 6, 12, 18, 24, 4, 8, 12, 16, 20].includes(idx);
        } else if (pattern === "4 single Middle") {
        // Highlight center row (row index 2)
        return [6, 8, 16, 18].includes(idx);
        } else if (pattern === "4 inner & 4 outer") {
        // Highlight center row (row index 2)
        return [0, 24, 20, 4, 6, 8, 16, 18].includes(idx);
        } else if (pattern === "all 4 corner square(single) and any line") {
        // Highlight center row (row index 2)
        return [0, 24, 20, 4, 6, 8, 16, 18, 10, 11, 12, 13, 14, 2, 7, 12, 17, 22, 6, 12, 18, 8, 12, 16].includes(idx);
      } else {
        return getPatternCells(pattern).includes(idx);
      }
    });

    return (
      <div key={idx} className={isRed ? "highlight" : ""}>
        {idx === 12 ? "FREE" : ""}
      </div>
    );
  })}
</div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

export default Topbar;

