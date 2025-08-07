import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Topbar from "../../components/TopBar";
import Sidebar from "../../components/Sidebar";
import BingoDashboard from "./BingoDashboard";
import { AuthContext } from "../../context/AuthContext";
import {
  saveGameState,
  loadGameState,
  
  
} from "../../utils/indexedDB"; 
import "../../styles/signStyle.css";

const SupportDashboard = ({
  calledNumbers,
  setCalledNumbers,
  bingoCards,
  setBingoCards,
  winnerAmount,
  setWinnerAmount,
  selectedCardIds,
  setSelectedCardIds,
  commissionPercent,
  setCommissionPercent,
  eachCardAmount,
  setEachCardAmount,
  cardCount,
  setCardCount
}) => {
  const { user, userRole, userId } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [winningCardIds, setWinningCardIds] = useState([]);
  const topbarRef = useRef();
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const location = useLocation(); 
  const userName = user?.name;

  // 🔐 Redirect if not support
  useEffect(() => {
    if (userRole !== "support") {
      navigate("/support/signin");
    }
  }, [userRole, navigate]);

  // 📦 Load game state (from route or IndexedDB)
  useEffect(() => {
    const loadGameStateFromRouteOrCache = async () => {
      if (location?.state) {
        const {
          commissionPercent: fromStateCommission,
          eachCardAmount: fromStateAmount,
          cardCount: fromStateCount,
        } = location.state;

        if (fromStateCommission > 0) setCommissionPercent(fromStateCommission);
        if (fromStateAmount > 0) setEachCardAmount(fromStateAmount);
        if (fromStateCount > 0) setCardCount(fromStateCount);

        await saveGameState({
          commissionPercent: fromStateCommission,
          eachCardAmount: fromStateAmount,
          cardCount: fromStateCount
        });
      } else {
        const cached = await loadGameState();
        if (cached) {
          setCommissionPercent(cached.commissionPercent || 0);
          setEachCardAmount(cached.eachCardAmount || 0);
          setCardCount(cached.cardCount || 0);
        }
      }
    };

    loadGameStateFromRouteOrCache();
  }, [location?.state]);

  // 🔁 Save game state changes to IndexedDB
  useEffect(() => {
    const saveCurrentState = async () => {
      await saveGameState({
        commissionPercent,
        eachCardAmount,
        cardCount,
        calledNumbers,
        selectedCardIds,
        winnerAmount,
      });
    };
    saveCurrentState();
  }, [commissionPercent, eachCardAmount, cardCount, calledNumbers, selectedCardIds, winnerAmount]);

  const resetGameState = () => {
    setCalledNumbers([]);
    setWinnerAmount(0);
    setWinningCardIds([]);
    setEachCardAmount(0);
    setCardCount(0);
  };

  const handleGoToCardPage = () => {
    navigate("/bingocardpage", {
      state: {
        userId,
        userName,
        calledNumbers,
        winningCardIds,
        commissionPercent,
        eachCardAmount,
        cardCount
      }
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("Offline logout fallback triggered.");
    } finally {
      navigate("/support/signin");
    }
  };

  const handleCommissionDeducted = () => {
    if (topbarRef.current?.fetchBalance) {
      topbarRef.current.fetchBalance();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        userRole={userRole}
        userId={userId}
        handleLogout={handleLogout}
      />

      <div className="main-content">
        <Topbar
          ref={topbarRef}
          isCollapsed={!sidebarOpen}
          userName={userName}
          userRole={userRole}
          userId={userId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="p-4 max-w-xl mx-auto">
          <BingoDashboard
            topbarRef={topbarRef}
            userRole={userRole}
            userId={userId}
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
            winningCardIds={winningCardIds}
            setWinningCardIds={setWinningCardIds}
            handleGoToCardPage={handleGoToCardPage}
            user={user}
            onCommissionDeducted={handleCommissionDeducted}
            resetGameState={resetGameState}
          />
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
