import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Home from "./pages/Home";
import FounderSignin from "./pages/founder/FounderSignin";
import FounderDashboard from "./pages/founder/FounderDashboard";
import SupportSignin from "./pages/support/SupportSignin";
import SupportDashboard from "./pages/support/SupportDashboard";

const App = () => {
  return (
    <Router>
      <AuthProvider>
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
