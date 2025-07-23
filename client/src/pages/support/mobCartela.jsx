import React, { useState } from "react";
import "../../styles/mobCartelaStyle.css";
import cardsDefault from "../../data/bingoCards_default.json";
import cardsClassic from "../../data/bingoCards_classic.json";
import cardsPatternA from "../../data/bingoCards_patternA.json";
import cardsPatternB from "../../data/bingoCards_patternB.json";

const BingoCard = ({ card }) => {
  const [selectedCells, setSelectedCells] = useState(new Set());

  const toggleCell = (rowIdx, colIdx) => {
    const key = `${colIdx}-${rowIdx}`;
    const updated = new Set(selectedCells);
    if (updated.has(key)) updated.delete(key);
    else updated.add(key);
    setSelectedCells(updated);
  };

  return (
    <div className="bingo-grid">
      {card.map((row, rowIdx) =>
        row.map((num, colIdx) => (
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

const CardBox = () => {
  const [inputId, setInputId] = useState("");
  const [cardType, setCardType] = useState("default");
  const [foundCard, setFoundCard] = useState(null);

  const getCardsData = () => {
    switch (cardType) {
      case "classic":
        return cardsClassic;
      case "patternA":
        return cardsPatternA;
      case "patternB":
        return cardsPatternB;
      default:
        return cardsDefault;
    }
  };

  const handleSearch = () => {
    const cardsData = getCardsData();
    const found = cardsData.find((card) => card.id === parseInt(inputId));
    setFoundCard(found || null);
  };

  return (
    <div className="card-box">
      <div className="card-options">
        <select value={cardType} onChange={(e) => setCardType(e.target.value)}>
          <option value="default">Default</option>
          <option value="classic">Classic</option>
          <option value="patternA">Pattern A</option>
          <option value="patternB">Pattern B</option>
        </select>
      </div>
      <div className="card-search">
        <input
          type="number"
          placeholder="Enter Cartela ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
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
  return (
    <div className="bingo-page">
      <CardBox />
      <CardBox />
      <CardBox />
      <CardBox />
    </div>
  );
};

export default BingoCardPage;
