import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import '../../styles/BingoBoard.css';
import Topbar from "../../components/TopBar";
import { FiRefreshCcw } from "react-icons/fi";
import axios from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import { FaMoneyBillWave, FaEraser, FaSearch, FaGamepad } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function BingoCardPage({
  bingoCards = [],
  setBingoCards,
  winnerAmount = 0,
  setWinnerAmount,
  selectedCardIds = [],
  setSelectedCardIds,
  commissionPercent,
  setCommissionPercent,
  eachCardAmount,
  setEachCardAmount,
  cardCount,
  setCardCount,
}) {
  const [winnerAmountInput, setWinnerAmountInput] = useState('');
  const [isWinnerAmountSet, setIsWinnerAmountSet] = useState(false);
  const [searchCardId, setSearchCardId] = useState('');
  const [foundCard, setFoundCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const [startMessage, setStartMessage] = useState('');
  const { userId, userRole, userName } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { winningCardIds = [], calledNumbers = [] } = location.state || {};

  // Load bingo cards based on support's bingoCardType
  useEffect(() => {
    const loadBingoCard = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/auth/support/profile`, { withCredentials: true });

        console.log("Support profile response:", res.data);

        const bingoCardType = res.data.bingoCardType || "default";

        // Try loading the file
        console.log("Fetching bingo cards for type:", bingoCardType);
        let cardRes = await fetch(`/bingoCards/bingoCards.${bingoCardType}.json`);
        if (!cardRes.ok) {
          console.warn(`Card file for type "${bingoCardType}" not found. Falling back to default.`);
          cardRes = await fetch(`/bingoCards/bingoCards.default.json`);
          console.log("Support profile response:", res.data);
        }

        const text = await cardRes.text();
        const json = JSON.parse(text); // Safe parse (will throw if invalid)
        setBingoCards(json.cards || json);
      } catch (err) {
        console.error("Failed to load cards:", err);
        setBingoCards([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "support") {
      loadBingoCard();
    }
  }, [userRole, setBingoCards]);

  useEffect(() => {
    if (startMessage) {
      const timer = setTimeout(() => {
        setStartMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [startMessage]);

  const handleSetWinnerAmount = () => {
    const cardAmount = parseFloat(winnerAmountInput);
    if (isNaN(cardAmount) || cardAmount < 10) {
      setStartMessage('⛔ እባክዎ ከ 10 ብር በላይ ያለ የካርቴላ ዋጋ ያስገቡ።');
      return;
    }

    const count = selectedCardIds.length;
    if (count === 0) {
      setStartMessage('እባክዎ ካርቴላ ይምረጡ።');
      return;
    }

    const total = count * cardAmount;
    const commission = (commissionPercent / 100) * total;
    const finalAmount = total - commission;

    setWinnerAmount(Math.round(finalAmount));
    setIsWinnerAmountSet(true);
    setEachCardAmount(cardAmount);
    setCardCount(count);
    setWinnerAmountInput('');
  };

  const handleClearWinnerAmount = () => {
    setWinnerAmount(0);
    setIsWinnerAmountSet(false);
    setEachCardAmount(eachCardAmount);
    setCardCount(selectedCardIds.length);
  };

  const handleSelectCard = (cardId) => {
    const updated = selectedCardIds.includes(cardId)
      ? selectedCardIds.filter((id) => id !== cardId)
      : [...selectedCardIds, cardId];
    setSelectedCardIds(updated);
  };

  const handleNavigateToGame = () => {
    navigate("/support/dashboard", {
      state: {
        calledNumbers,
        winningCardIds,
        commissionPercent,
        eachCardAmount,
        cardCount,
      }
    });
  };

  const handleFindCard = () => {
    const cardId = parseInt(searchCardId);
    if (isNaN(cardId)) {
      setStartMessage('choose proper cartela Id!');
      return;
    }

    const found = bingoCards.find((card) => card.id === cardId);
    if (!found) {
      setFoundCard(null);
      setStartMessage('ካርቴላ ቁጥር አልተገኘም!');
      return;
    }

    setFoundCard(found);

    if (!selectedCardIds.includes(cardId)) {
      setSelectedCardIds((prev) => [...prev, cardId]);
    }
  };

  const handleNewSelection = () => {
    setSelectedCardIds([]);
    setFoundCard(null);
    setSearchCardId('');
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      navigate("/support/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const renderCard = (card) => {
    const isSelected = selectedCardIds.includes(card.id);
    return (
      <div
        key={card.id}
        className="bingo-card-id"
        onClick={() => handleSelectCard(card.id)}
      >
        <span className={`card-id-circle ${isSelected ? 'selected' : ''}`}>
          {card.id}
        </span>
      </div>
    );
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
      <div className="main-contentt">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCollapsed={!sidebarOpen}
          userId={userId}
        />
        <div className="bingo-card-pagee">
          {/* Winner amount input */}
          <div className="winner-winner">
            {!isWinnerAmountSet ? (
              <div className="input-group">
                <input
                  type="number"
                  value={winnerAmountInput}
                  onChange={(e) => setWinnerAmountInput(e.target.value)}
                  placeholder="amount"
                  min="10"
                  className="winner-amount-input"
                />
                <select
                  className="select-commission"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button className='new_card_button' onClick={handleSetWinnerAmount}>
                  <FaMoneyBillWave style={{ marginRight: '8px' }} /> Amount
                </button>
              </div>
            ) : (
              <div className="winner-amount-display">
                <h2>winner amount {winnerAmount} Birr</h2>
                <div className="winner-actions">
                  <button onClick={handleClearWinnerAmount} className="new_card_button">
                    <FaEraser style={{ marginRight: '8px' }} /> Clear Amount
                  </button>
                </div>
              </div>
            )}
          </div>
          {startMessage && (
            <div className="signin-error">
              {startMessage}
            </div>
          )}
          {/* Actions */}
          <div className="action-buttons">
            <div className="find-card-input">
              <input
                className="winner-amount-input"
                type="number"
                value={searchCardId}
                onChange={(e) => setSearchCardId(e.target.value)}
                placeholder="input card Id"
                min="1"
                max="300"
              />
              <button onClick={handleFindCard} className="new_card_button">
                <FaSearch style={{ marginRight: '8px' }} /> Search
              </button>
            </div>
            <button onClick={handleNewSelection} className="new_card_button">
              <FiRefreshCcw style={{ marginRight: '8px' }} /> Clear
            </button>
            <button onClick={handleNavigateToGame} className="new_card_button">
              <FaGamepad style={{ marginRight: '8px' }} /> Save
            </button>
          </div>
          {foundCard && (
            <div className="found-card">
              {renderCard(foundCard)}
            </div>
          )}
          {selectedCardIds.length > 0 && (
            <div className="selected-cards">
              <h3>Selected cartela</h3>
              <div className="selected-card-container">
                {selectedCardIds.map((id) => (
                  <span
                    key={id}
                    onClick={() => handleSelectCard(id)}
                    className="card-id-circle-selected"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading">loading cartela...</div>
          ) : (
            <div className="bingo-cards">
              {Array.isArray(bingoCards) && bingoCards.length > 0 ? (
                bingoCards.map(renderCard)
              ) : (
                <div className='signin-error'>No cartela found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

BingoCardPage.propTypes = {
  bingoCards: PropTypes.array.isRequired,
  setBingoCards: PropTypes.func.isRequired,
  setWinnerAmount: PropTypes.func.isRequired,
  winnerAmount: PropTypes.number,
  selectedCardIds: PropTypes.array,
  setSelectedCardIds: PropTypes.func.isRequired,
  commissionPercent: PropTypes.number.isRequired,
  setCommissionPercent: PropTypes.func.isRequired,
  eachCardAmount: PropTypes.number.isRequired,
  setEachCardAmount: PropTypes.func.isRequired,
  cardCount: PropTypes.number.isRequired,
  setCardCount: PropTypes.func.isRequired,
};

export default BingoCardPage;
