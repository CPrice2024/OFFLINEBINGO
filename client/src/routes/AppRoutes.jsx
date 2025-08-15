import { Routes, Route } from "react-router-dom";
import { useState, useContext, useRef } from "react";
import "../styles/signStyle.css";

// Founder pages
import FounderSignin from "../pages/founder/FounderSignin";
import Users from "../pages/founder/UsersPage";
import CreditPage from "../pages/founder/CreditPage"; 
import MainDashboard from "../pages/founder/Dashboard"; 

// Support pages
import SupportSignin from "../pages/support/SupportSignin";
import SupportDashboard from "../pages/support/SupportDashboard";
import SupportResultsPage from "../pages/support/SupportResultsPage";
import BingoCardPage from "../pages/support/BingoCardPage";
import MobCartela from "../pages/support/mobCartela";


// Utilities
import ProtectedRoute from "../auth/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";

const AppRoutes = () => {
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [bingoCards, setBingoCards] = useState([]);
  const [winnerAmount, setWinnerAmount] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [winningCards, setWinningCards] = useState([]);
  const [commissionPercent, setCommissionPercent] = useState(0);
  const [eachCardAmount, setEachCardAmount] = useState(0);
  const [cardCount, setCardCount] = useState(0);
  const topbarRef = useRef(null);


  const { userId, userName, setUserId, setUserName } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<SupportSignin />} />
      <Route path="/mobileCartela" element={<MobCartela />} />


      

      {/* Founder Routes */}
      <Route path="/main" element={<FounderSignin />} />

      <Route
        path="/main/Users"
        element={
          <ProtectedRoute allowedRole="founder">
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/main/Credit"
        element={
          <ProtectedRoute allowedRole="founder">
            <CreditPage userId={userId} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/main/dashboard"
        element={
          <ProtectedRoute allowedRole="founder">
            <MainDashboard
              topbarRef={topbarRef}
              userId={userId}
              userName={userName}
              calledNumbers={calledNumbers}
              setCalledNumbers={setCalledNumbers}
              bingoCards={bingoCards}
              setBingoCards={setBingoCards}
              winnerAmount={winnerAmount}
              setWinnerAmount={setWinnerAmount}
              selectedCardIds={selectedCardIds}
              setSelectedCardIds={setSelectedCardIds}
              commissionPercent={commissionPercent}
              setCommissionPercent={setCommissionPercent}
              eachCardAmount={eachCardAmount}
              setEachCardAmount={setEachCardAmount}
              cardCount={cardCount}
              setCardCount={setCardCount}
              winningCards={winningCards}
              setWinningCards={setWinningCards}
            />
          </ProtectedRoute>
        }
      />

      {/* Support Routes */}
      <Route
        path="/Agent/signin"
        element={
          <SupportSignin setUserId={setUserId} setUserName={setUserName} />
        }
      />
      <Route
        path="/Agent/dashboard"
        element={
          <ProtectedRoute allowedRole="support">
            <SupportDashboard
              topbarRef={topbarRef}
              userId={userId}
        userName={userName} 
        calledNumbers={calledNumbers}
        setCalledNumbers={setCalledNumbers}
        bingoCards={bingoCards}
        setBingoCards={setBingoCards}
        winnerAmount={winnerAmount}
        setWinnerAmount={setWinnerAmount}
        selectedCardIds={selectedCardIds}
        setSelectedCardIds={setSelectedCardIds}
        commissionPercent={commissionPercent}
        setCommissionPercent={setCommissionPercent}
        eachCardAmount={eachCardAmount}
        setEachCardAmount={setEachCardAmount}
        cardCount={cardCount}
        setCardCount={setCardCount}
        winningCards={winningCards}
        setWinningCards={setWinningCards}
        setUserId={setUserId}
        setUserName={setUserName}
      onCommissionDeducted={(amount) => {
          setWinnerAmount(amount);
          setCommissionPercent(0); // Reset commission after deduction

        }}
        onWinningCardsUpdated={(cards) => {
          setWinningCards(cards);
        }}
        
      />
    </ProtectedRoute>
  }
/>

      <Route
        path="/sales"
        element={
          <ProtectedRoute allowedRole="support">
            <SupportResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/BingoCartela"
        element={
          <ProtectedRoute allowedRole="support">
            <BingoCardPage
              userId={userId}
              userName={userName}
              calledNumbers={calledNumbers}
              setCalledNumbers={setCalledNumbers}
              bingoCards={bingoCards}
              setBingoCards={setBingoCards}
              winnerAmount={winnerAmount}
              setWinnerAmount={setWinnerAmount}
              selectedCardIds={selectedCardIds}
              winningCardIds={winningCards}
              setWinningCardIds={setWinningCards}
              setSelectedCardIds={setSelectedCardIds} 
              commissionPercent={commissionPercent}
              setCommissionPercent={setCommissionPercent}
              eachCardAmount={eachCardAmount}
              setEachCardAmount={setEachCardAmount}
              cardCount={cardCount}
              setCardCount={setCardCount}
              
            />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<SupportSignin />} />
    </Routes>
  );
};

export default AppRoutes;
