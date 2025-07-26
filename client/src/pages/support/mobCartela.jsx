import React, { useState } from "react";
import "../../styles/mobCartelaStyle.css";

const BingoCard = ({ card }) => {
  const [selectedCells, setSelectedCells] = useState(new Set());

  const toggleCell = (rowIdx, colIdx) => {
    const key = `${colIdx}-${rowIdx}`;
    const updated = new Set(selectedCells);
    if (updated.has(key)) updated.delete(key);
    else updated.add(key);
    setSelectedCells(updated);
  };

  // Transpose the card: columns instead of rows
  const transposedCard = card[0].map((_, colIdx) =>
    card.map((_, rowIdx) => card[rowIdx][colIdx])
  );

  return (
    <div className="bingo-grid">
      {transposedCard.map((col, colIdx) =>
        col.map((num, rowIdx) => (
          <div
            key={`${colIdx}-${rowIdx}`}
            className={`bingo-cell ${
              selectedCells.has(`${colIdx}-${rowIdx}`) ? "selected" : ""
            }`}
            onClick={() => toggleCell(rowIdx, colIdx)}
          >
            {num === 0 ? "0" : num}
          </div>
        ))
      )}
    </div>
  );
};

const CardBox = ({ cardType }) => {
  const [inputId, setInputId] = useState("");
  const [foundCard, setFoundCard] = useState(null);

  const getCardsData = async () => {
    const response = await fetch(`/bingoCards/bingoCards.${cardType}.json`);
    return await response.json();
  };

  const handleSearch = async () => {
    try {
      const cardsData = await getCardsData();
      const found = cardsData.find((card) => card.id === parseInt(inputId));
      setFoundCard(found || null);
    } catch (error) {
      console.error("Failed to load cards:", error);
      setFoundCard(null);
    }
  };

  const handleClear = () => {
    setInputId("");
    setFoundCard(null);
  };

  return (
    <div className="card-box">
      <div className="card-search">
        <input
          type="number"
          placeholder="Enter Cartela ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      </div>
      {foundCard ? (
        <BingoCard card={foundCard.card} />
      ) : (
        <div className="blank-space">No Cartela Found</div>
      )}
    </div>
  );
};

const BingoCardPage = () => {
  const [cardType, setCardType] = useState("A100");

  return (
    <div className="bingo-page">
      <div className="card-options">
        <select value={cardType} onChange={(e) => setCardType(e.target.value)}>
          <option value="A100">A100</option>
          <option value="A200">A200</option>
          <option value="W60">W60</option>
          <option value="R250">R250</option>
        </select>
      </div>
      <CardBox cardType={cardType} />
      <CardBox cardType={cardType} />
      <CardBox cardType={cardType} />
      <CardBox cardType={cardType} />
    </div>
  );
};

export default BingoCardPage;
