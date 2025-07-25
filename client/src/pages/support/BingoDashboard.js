import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from "../../api/axios";
import PropTypes from 'prop-types';
import seedrandom from 'seedrandom';
import bingoBallDefault from '../../assets/bingo-ball.png';
import bingoBall1 from '../../assets/bingo-ball-1.png';
import bingoBall2 from '../../assets/bingo-ball-2.png';
import bingoBall3 from '../../assets/bingo-ball-3.png';
import bingoBall4 from '../../assets/bingo-ball-4.png';
import bingoBall5 from '../../assets/bingo-ball-5.png';
import { getPatternCells } from '../../utils/patternUtils';


import {
  useCallSound,
  usePauseSound,
  useReadySound,
  useCleanSound,
  useVerifySuccessSound,
  useVerifyFailSound
} from '../../components/sounds';

import '../../styles/BingoBoard.css';
import { MdPlayArrow, MdRestartAlt, MdPause } from 'react-icons/md';
import { MdGridView } from "react-icons/md";
import { FaCheck, FaEye } from "react-icons/fa";
import { MdCleaningServices } from 'react-icons/md';
import '../../styles/showCardDetails.css';
import { useNavigate  } from "react-router-dom";

const bingoColumns = {
  B: Array.from({ length: 15 }, (_, i) => i + 1),
  I: Array.from({ length: 15 }, (_, i) => i + 16),
  N: Array.from({ length: 15 }, (_, i) => i + 31),
  G: Array.from({ length: 15 }, (_, i) => i + 46),
  O: Array.from({ length: 15 }, (_, i) => i + 61),
};

const BingoDashboard = ({
  calledNumbers = [],
  setCalledNumbers,
  bingoCards = [],
  winnerAmount = 0,
  selectedCardIds = [],
  setSelectedCardIds, // <-- Add this line
  userId = "",
  commissionPercent = 0,
  eachCardAmount = 0,
  cardCount = 0,
  onCommissionDeducted = () => {},
  topbarRef,
}) => {

  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [inputCardId, setInputCardId] = useState('');
  const [result, setResult] = useState('');
  const [winningCards, setWinningCards] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [callSpeed, setCallSpeed] = useState(1500);
  const rngRef = useRef(seedrandom(Date.now().toString()));
  const dashboardRef = useRef(null);
  const hasSavedSummary = useRef(false);
  const [animateBall, setAnimateBall] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [startMessage, setStartMessage] = useState('');
  const totalPrizePool = cardCount * eachCardAmount;
  const commission = (commissionPercent / 100) * totalPrizePool;
  const winnerAmountCalculated = totalPrizePool - commission;
  const [gameStartTrigger, setGameStartTrigger] = useState(0);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);
  const [checkingNumbers, setCheckingNumbers] = useState(false);
  const navigate = useNavigate();

const playCallSound = useCallSound();
const playPauseSound = usePauseSound();
const playReadySound = useReadySound();
const playCleanSound = useCleanSound();
const playSuccessSound = useVerifySuccessSound();
const playFailSound = useVerifyFailSound();

  const speedOptions = [
    { value: 1400, label: 'በቂ' },
    { value: 1200, label: 'ፈጣን' },
    { value: 1000, label: 'በጣም ፈጣን' },
  ];

  const getBingoBallImage = () => {
  if (!isGameRunning || currentNumber === null) return bingoBallDefault;
  if (currentNumber >= 1 && currentNumber <= 15) return bingoBall1;
  if (currentNumber >= 16 && currentNumber <= 30) return bingoBall2;
  if (currentNumber >= 31 && currentNumber <= 45) return bingoBall3;
  if (currentNumber >= 46 && currentNumber <= 60) return bingoBall4;
  if (currentNumber >= 61 && currentNumber <= 75) return bingoBall5;
  return bingoBallDefault; 
};

const [highlighted, setHighlighted] = useState([]);
  const [patternIndex, setPatternIndex] = useState(0);

  const fullRow = (i) => Array.from({ length: 5 }, (_, j) => i * 5 + j);
  const fullCol = (i) => Array.from({ length: 5 }, (_, j) => i + j * 5);

  const patterns = [
    fullRow(2),       
    fullCol(2),       
    [0, 6, 12, 18, 24], 
    [4, 8, 12, 16, 20], 
    [0, 4, 20, 24],    
  ];

    useEffect(() => {
    const interval = setInterval(() => {
      setHighlighted(patterns[patternIndex]);
      setPatternIndex((prev) => (prev + 1) % patterns.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [patternIndex]);

  const initializeGame = useCallback(() => {
    const seed = Date.now().toString();
    rngRef.current = seedrandom(seed);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setWinningCards([]);
    setResult('');
    setIsPaused(false);
  }, [setCalledNumbers]);

  const calculateAdjustedWinningAmount = () => {
  if (winningCards.length === 0) return winnerAmount;
  return winnerAmount;
};


  const callNumber = useCallback(() => {
  if (!isGameRunning || isPaused) return;

  if (calledNumbers.length === 75) {
  setIsGameRunning(false);
  setCurrentNumber(null); 
  return;
}


  let randomNumber;
  do {
    randomNumber = Math.floor(rngRef.current() * 75) + 1;
  } while (calledNumbers.includes(randomNumber));

  setCalledNumbers(prev => [...prev, randomNumber]);
  setCurrentNumber(randomNumber);
  playCallSound(randomNumber);


  setAnimateBall(true);
  setTimeout(() => setAnimateBall(false), 400);
}, [isGameRunning, isPaused, calledNumbers, playCallSound, setCalledNumbers]);


const saveSummaryToBackend = async (winningCardIds) => {
  try {
    const payload = {
      calledNumbers,
      winningCardIds,
      winnerAmount,
      userId,
      commissionPercent,
      eachCardAmount,
      cardCount,
      initial: true,
    };

    console.log("Saving game summary payload:", payload); 
    await axios.post("/game-results/save-summary", payload);

  } catch (error) {
    console.error("❌ Failed to save summary:", error?.response?.data || error.message);
    setStartMessage("⛔ ውጤት ማስቀመጥ አልተቻለም።");
  }
};

  useEffect(() => {
    let interval;
    if (isGameRunning && !isPaused) {
      interval = setInterval(callNumber, callSpeed);
    }
    return () => clearInterval(interval);
  }, [isGameRunning, isPaused, callNumber, callSpeed, gameStartTrigger]);


const getPatternsAndLogic = () => {
  if (!topbarRef.current) return { patterns: [], useAnd: false };
  return {
    patterns: topbarRef.current.getSelectedPatterns?.() || [],
    useAnd: topbarRef.current.getUseAndLogic?.() || false,
  };
};


const closeCardModal = () => {
  setShowCardModal(false);
  setSelectedCard(null);
};

const deductCommission = async () => {
  const totalPrizePool = cardCount * eachCardAmount;
  const commission = (commissionPercent / 100) * totalPrizePool;

  if (!userId || commission <= 0) {
    console.warn("❌ Invalid commission deduction input", { userId, commission });
    return false;
  }

  try {
    console.log("📤 Sending commission deduction payload:", {
      userId,
      amount: commission,
    });

    await axios.post("/auth/support/deduct", {
      userId,
      amount: commission,
    });

    // ✅ Refresh Topbar balance
    if (topbarRef?.current?.fetchBalance) {
      topbarRef.current.fetchBalance();
    }

    if (typeof onCommissionDeducted === "function") {
      onCommissionDeducted(); // Optional
    }

    console.log("✅ Commission deducted successfully:", commission);
    return true;

  } catch (error) {
    const message = error?.response?.data?.message || error.message;
    console.error("❌ Commission deduction failed:", message);
    setStartMessage(`⛔ ኮሚሽኑን መቀነስ አልተቻለም። ${message}`);
    return false;
  }
};

const startGame = async () => {
  if (!isGameRunning && !hasSavedSummary.current) {
    if (!userId || commissionPercent <= 5|| cardCount <= 1 || eachCardAmount <= 10) {
      setStartMessage("⛔ ጨዋታ ለማስጀመር መጀመሪያ ደራሽ ያዘጋጁ! እንደገና ይሞክሩ።");
      return;
    }

    // ✅ Get balance from Topbar via ref
    const currentBalance = topbarRef?.current?.getBalance?.();
    const totalPrizePool = cardCount * eachCardAmount;
    const commission = (commissionPercent / 100) * totalPrizePool;

    if (currentBalance === 0 || currentBalance < commission) {
      setStartMessage(`⛔ ለማስጀመር ${commission.toFixed(1)} ብር ያስፈልጋል። ቀሪ ሂሳብዎ ${parseFloat(currentBalance).toFixed(1) ?? 0} ብር ነው።`);
      return;
    }

    initializeGame();

    // ✅ Delay isGameRunning to wait for reset
    setTimeout(() => {
      setIsGameRunning(true);
      setGameStartTrigger(prev => prev + 1);
    }, 50);

    hasSavedSummary.current = true;

    try {
      const success = await deductCommission();
      if (!success) {
        setStartMessage("⛔ ኮሚሽን መቀነስ አልተቻለም። ጨዋታ አልተጀመረም።");
        setIsGameRunning(false);
        return;
      }

      const payload = {
        cardCount,
        commissionPercent,
        calledNumbers: [],
        winningCardIds: [],
        userId,
        eachCardAmount,
        initial: true,
      };

      await axios.post("/game-results/save-summary", payload);

    } catch (error) {
      const message = error?.response?.data?.message || error.message;
      console.error("❌ Summary save failed:", message);
      setStartMessage(`⛔ ውጤት ማስቀመጥ አልተቻለም። ${message}`);
    }
  } else if (isPaused) {
    setIsPaused(false);
  }
};


const restartGame = () => {
  // Reset local state
  initializeGame();
  hasSavedSummary.current = false;

  setWinningCards([]);
  setCurrentNumber(null);
  setResult('');
  setInputCardId('');
  setIsPaused(false);

  // Clear parent states
  if (typeof setCalledNumbers === 'function') setCalledNumbers([]);

  // Restart game
  setIsGameRunning(true);
};


  const cleanGame = () => {
  setIsGameRunning(false);
  setIsPaused(false);
  setCalledNumbers([]);
  setCurrentNumber(null);
  setWinningCards([]);
  setResult('');
  setInputCardId('');
  hasSavedSummary.current = false
};


  const pauseGame = () => {
     playPauseSound(); 
    setIsPaused(true);
  };

const goToBingoCardPage = () => {
  navigate("/BingoCartela", {
    state: {
      winningCardIds: winningCards,
      calledNumbers,
      userId,
    },
  });}

const verifyCard = (card) => {
  const { card: cardNumbers } = card;
  const { patterns: selectedPatterns, useAnd: useAndLogic } = getPatternsAndLogic();


  const isNumberCalled = (num) => num === 0 || calledNumbers.includes(num);

  const checkDefaultWin = () => {
    const horizontalWin = cardNumbers.some(row => row.every(isNumberCalled));
    const verticalWin = cardNumbers[0].some((_, colIndex) =>
      cardNumbers.every(row => isNumberCalled(row[colIndex]))
    );
    const diagonal1 = cardNumbers.every((row, idx) => isNumberCalled(row[idx]));
    const diagonal2 = cardNumbers.every((row, idx) => isNumberCalled(row[4 - idx]));
    const cornersWin =
      isNumberCalled(cardNumbers[0][0]) &&
      isNumberCalled(cardNumbers[0][4]) &&
      isNumberCalled(cardNumbers[4][0]) &&
      isNumberCalled(cardNumbers[4][4]);

    return horizontalWin || verticalWin || diagonal1 || diagonal2 || cornersWin;
  };

const checkPattern = (patternName) => {
  const patternGroups = getPatternCells(patternName);
  if (!patternGroups || patternGroups.length === 0) return false;

  return patternGroups.some(group =>
    group.every(cellIndex => {
      const row = Math.floor(cellIndex / 5);
      const col = cellIndex % 5;
      return isNumberCalled(cardNumbers[row][col]);
    })
  );
};



  // ✅ Use Topbar-selected patterns first if any
  if (
    selectedPatterns &&
    Array.isArray(selectedPatterns) &&
    selectedPatterns.length > 0
  ) {
    const matchedPatterns = selectedPatterns.filter(pattern => checkPattern(pattern));

    const isWinner = useAndLogic
      ? matchedPatterns.length === selectedPatterns.length // AND: all must match
      : matchedPatterns.length > 0;                        // OR: any match

     return { isWinner, winType: 'pattern', matchedPatterns };

  }

  // ✅ Check default win conditions
  return { isWinner: checkDefaultWin(), winType: 'default' };
};

const isWinningNumber = (cardNumbers, rowIndex, colIndex, calledNumbers) => {
  const row = cardNumbers.map(col => col[rowIndex]);
  const colVals = cardNumbers[colIndex];

  const isRowWin = row.every(num => calledNumbers.includes(num));
  const isColWin = colVals.every(num => calledNumbers.includes(num));
  const isDiagonal1 =
    rowIndex === colIndex &&
    [0, 1, 2, 3, 4].every(i => calledNumbers.includes(cardNumbers[i][i]));
  const isDiagonal2 =
    rowIndex + colIndex === 4 &&
    [0, 1, 2, 3, 4].every(i => calledNumbers.includes(cardNumbers[i][4 - i]));
  const isCorner =
    ((rowIndex === 0 && colIndex === 0) ||
      (rowIndex === 0 && colIndex === 4) ||
      (rowIndex === 4 && colIndex === 0) ||
      (rowIndex === 4 && colIndex === 4)) &&
    [cardNumbers[0][0], cardNumbers[0][4], cardNumbers[4][0], cardNumbers[4][4]].every(num =>
      calledNumbers.includes(num)
    );

  return isRowWin || isColWin || isDiagonal1 || isDiagonal2 || isCorner;
};
useEffect(() => {
  if (startMessage) {
    const timer = setTimeout(() => {
      setStartMessage('');
    }, 10000); 

    return () => clearTimeout(timer); 
  }
}, [startMessage]);

const handleCheck = () => {
  playCleanSound(); // 🔊 play sound
  console.log("✅ Check button clicked");
};

const handleMix = () => {
  playReadySound(); // 🔊 play sound
  console.log("✅ Mix button clicked");

  const interval = setInterval(() => {
    // pick 5 unique random numbers between 1–75
    const numbers = new Set();
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 75) + 1);
    }
    setHighlightedNumbers(Array.from(numbers));
  }, 150); // Change every 150ms

  setTimeout(() => {
    clearInterval(interval);
    setHighlightedNumbers([]); // Clear after 3 seconds
  }, 3000);
};



const verifyAndShowCard = () => {
  const cardId = parseInt(inputCardId);

  if (!inputCardId || isNaN(cardId)) {
    setStartMessage('አባክዎ የሚያገለግል ካርቴላ ቁጥር ያስገቡ!');
    playFailSound();
    return;
  }

  if (!selectedCardIds.includes(cardId)) {
    setStartMessage(`ካርቴላ ${cardId} አልተመረጠም!`);
    playFailSound();
    return;
  }

  const card = bingoCards.find(c => c.id === cardId);
  if (!card) {
    setStartMessage('ምንም ካርቴላ ቁጥር አልተገኘም!');
    playFailSound();
    return;
  }

const { isWinner, winType, matchedPatterns } = verifyCard(card);

  const winAmount = calculateAdjustedWinningAmount();

  if (isWinner) {
 const patternText =
  winType === 'pattern'
    ? ` pattern(s): ${matchedPatterns?.join(", ") || 'default'} `
    : '';

setStartMessage(
  `🎉 ቢንጎ! ካርቴላ ${cardId} አሸንፏል${patternText}የሽልማት መጠን ${winAmount} ብር`
);


  playSuccessSound();


    if (!winningCards.includes(cardId)) {
      const newWinners = [...winningCards, cardId];
      setWinningCards(newWinners);

      saveSummaryToBackend(newWinners);
    }
  } else {
    setStartMessage(`❌ ካርቴላ ${cardId} አላሸነፈም`);
    playFailSound();
  }

  setSelectedCard(card);
  setShowCardModal(true);
};
  useEffect(() => {
    if (selectedCardIds.length > 0 && calledNumbers.length > 0) {
      const newWinners = [];
      bingoCards.forEach(card => {
        const result = verifyCard(card);
if (selectedCardIds.includes(card.id) && result?.isWinner) {
  newWinners.push(card.id);
}

      });
      setWinningCards(newWinners);
    }
  }, [calledNumbers, selectedCardIds, bingoCards]);

  return (
    <div className="bingo-dashboard" ref={dashboardRef}>
  <div className="bingo-status-column">
  {/* 1. Bingo Play */}
  <div className="bingo-play-header">
    <div className="board">
        {Array.from({ length: 25 }, (_, i) => (
          <div
            key={i}
            className={`cell ${highlighted.includes(i) ? "highlight" : ""}`}
          />
        ))}
      </div>
  </div>

  {/* 2. Winner Info */}
  <div className="winner-info">
    <button className="winner-button">
    {winnerAmount > 0 ? calculateAdjustedWinningAmount().toFixed() : 0} ደራሽ
    </button>
    <div className="win-now-text">
      <div className="verify-section pop-style">
        <input
          type="number"
          className="winner-amount-input"
          placeholder="ካርቴላ ቁጥር"
          value={inputCardId}
          onChange={(e) => setInputCardId(e.target.value)}
        />
        <button
        className="winner-check"
        onClick={verifyAndShowCard}
        disabled={!inputCardId || isNaN(parseInt(inputCardId))}>
          <FaCheck style={{ marginRight: '8px' }} />
           አረጋግጥ 
           </button>

        {result && (
  <p className="signin-error">{result}</p>
)}

      </div>
    </div>
  </div>

  {/* 3. Bingo Ball */}
 <div
      className={`bingo-ball-wrapper ${animateBall ? "" : ""}`}
      style={{
        backgroundImage: `url(${getBingoBallImage()})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center center",
        width: "240px",
        height: "240px",
        marginTop: -85,
        marginLeft: 75,
      }}
    >
      <div className="bingo-ball-number">
        {currentNumber !== null ? currentNumber : ""}
      </div>
    </div>
</div>



{startMessage && (
  <div className="signin-error">
    {startMessage}
  </div>
)}


      <div className="game-board pop-style">
        <div className="bingo-letters">
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div key={letter} className="bingo-letter">
              {letter}
            </div>
          ))}
        </div>

        {Array.from({ length: 15 }).map((_, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {['B', 'I', 'N', 'G', 'O'].map((letter, colIndex) => {
              const number = bingoColumns[letter][rowIndex];
              return (
                <div
                  key={colIndex}
                 className={`board-cell 
  ${calledNumbers?.includes?.(number) ? 'called pop' : ''} 
  ${highlightedNumbers.includes(number) ? 'flashing' : ''}`}


                >
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="game-controls pop-style">
        <div className="control-buttons">
          <button className="button_board" onClick={goToBingoCardPage}>
  <MdGridView style={{ marginRight: '8px' }} />
  ካርቴላ ምረጥ
</button>
         <button
  className='button_board'
  onClick={startGame}
  disabled={isGameRunning && !isPaused}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <MdPlayArrow />
  {calledNumbers.length === 0 ? 'ጀምር' : 'ቀጥል'}
</button>
<button
  className='button_board'
  onClick={pauseGame}
  disabled={!isGameRunning || isPaused}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <MdPause />
  አቁም
</button>
<button
  className='button_board'
  onClick={cleanGame}
  disabled={calledNumbers.length === 0 && !isGameRunning}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <MdCleaningServices />
  ተዘጋጅ
</button>
<button
  className='button_board'
  onClick={restartGame}
  disabled={!isGameRunning && calledNumbers.length === 0}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <MdRestartAlt />
  እንደገና
</button>
<button
  className="button_board"
  onClick={handleCheck}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <FaCheck />
  ዝግጁ!
</button>
<button
  className="button_board"
  onClick={handleMix}
  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <FaCheck />
  Shuffle
</button>
        </div>
        <div className="speed-control">
          <label htmlFor="speed-slider">የጥሪ ፍጥነት</label>
          <select
            id="speed-select"
            value={callSpeed}
            onChange={(e) => setCallSpeed(Number(e.target.value))}
            disabled={!isGameRunning || isPaused}
          >
            {speedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="range"
            id="speed-slider"
            min="700"
            max="1800"
            step="1"
            value={callSpeed}
            onChange={(e) => setCallSpeed(Number(e.target.value))}
            disabled={!isGameRunning || isPaused}
          />
          <span className="speed-value"></span>
        </div>
      </div>
      {showCardModal && selectedCard && (
        <div className="card-modal-overlay" onClick={closeCardModal}>
  <div className="card-modal pop-style" onClick={(e) => e.stopPropagation()}>
    <div className="card-modal-header">
      <h3>ካርቴላ {selectedCard.id}</h3>
      <button className="close-button" onClick={closeCardModal}>×</button>
    </div>

    <div className="card-grid-container">
      {/* BINGO Letters */}
      <div className="card-row">
        {['B', 'I', 'N', 'G', 'O'].map((letter) => (
          <div key={letter} className="card-cell card-header-cell">
            {letter}
          </div>
        ))}
      </div>

      {/* Transposed Numbers */}
     {Array.from({ length: 5 }).map((_, rowIndex) => (
  <div key={rowIndex} className="card-row">
    {selectedCard.card.map((col, colIndex) => {
      const number = col[rowIndex];

      const isCenter = rowIndex === 2 && colIndex === 2;
      const isCalled = calledNumbers.includes(number);
      const isWinning = isWinningNumber(selectedCard.card, rowIndex, colIndex, calledNumbers);

      let cellClass = 'cell-default';
      if (isCenter) {
        cellClass = 'cell-free';
      } else if (isWinning) {
        cellClass = 'cell-win';
      } else if (isCalled) {
        cellClass = 'cell-called';
      }

      return (
        <div key={colIndex} className={`card-cell ${cellClass}`}>
          {isCenter ? 'ነጻ' : number}
        </div>
      );
    })}
  </div>
))}
    </div>
  </div>
</div>

      )}
    </div>
  );
};
BingoDashboard.propTypes = {
  calledNumbers: PropTypes.array.isRequired,
  setCalledNumbers: PropTypes.func.isRequired,
  bingoCards: PropTypes.array.isRequired,
  winnerAmount: PropTypes.number.isRequired,
  selectedCardIds: PropTypes.array.isRequired,
  setSelectedCardIds: PropTypes.func.isRequired, // <-- Add this line
  userId: PropTypes.string.isRequired,
  commissionPercent: PropTypes.number.isRequired,
  eachCardAmount: PropTypes.number.isRequired,
  cardCount: PropTypes.number.isRequired,
  onCommissionDeducted: PropTypes.func,
};



export default BingoDashboard;
