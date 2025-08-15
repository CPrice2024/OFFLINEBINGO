import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Home from "./pages/Home";
import FounderSignin from "./pages/founder/FounderSignin";
import FounderDashboard from "./pages/founder/FounderDashboard";
import SupportSignin from "./pages/support/SupportSignin";
import SupportDashboard from "./pages/support/SupportDashboard";

import { useState, useEffect } from "react";
import Dexie from "dexie";
import axios from "axios";

// Setup IndexedDB
const db = new Dexie("bingoDB");
db.version(1).stores({
  offlineMoves: "++id,data"
});

const App = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (window.network) {
      window.network.onStatusChange((status) => {
        setOnline(status);
        if (status) {
          syncData();
        }
      });
    }
  }, []);

  const syncData = async () => {
    const allData = await db.offlineMoves.toArray();
    if (allData.length > 0) {
      try {
        await axios.post("/api/sync", { moves: allData });
        await db.offlineMoves.clear();
        console.log("Synced offline data to MongoDB Atlas");
      } catch (error) {
        console.error("Sync failed", error);
      }
    }
  };

  return (
    <Router>
      <AuthProvider>
        {/* Show network status bar */}
        <div
          style={{
            backgroundColor: online ? "#4caf50" : "#f44336",
            color: "white",
            padding: "5px",
            textAlign: "center"
          }}
        >
          {online ? "Online - Synced" : "Offline - Changes will sync later"}
        </div>

        <Routes>
          {/* Home Page */}
          <Route path="/" element={<Home />} />

          {/* Founder Routes */}
          <Route path="/founder/signin" element={<FounderSignin />} />
          <Route
            path="/founder/dashboard"
            element={
              <ProtectedRoute allowedRole="founder">
                <FounderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Support Routes */}
          <Route path="/support/signin" element={<SupportSignin />} />
          <Route
            path="/support/dashboard"
            element={
              <ProtectedRoute allowedRole="support">
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Page */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
