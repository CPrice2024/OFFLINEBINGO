import React, { useState } from "react";
import "../../styles/mobCartelaStyle.css";
import cardsA100 from "../../../public/bingoCards/bingoCards.A100.json";
import cardsA200 from "../../../public/bingoCards/bingoCards.A200.json";
import cardsW60 from "../../../public/bingoCards/bingoCards.W60.json";
import cardsR250 from "../../../public/bingoCards/bingoCards.R250.json";

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
  const [cardType, setCardType] = useState("A100");
  const [foundCard, setFoundCard] = useState(null);

  const getCardsData = () => {
    switch (cardType) {
      case "A200":
        return cardsA200;
      case "W60":
        return cardsW60;
      case "R250":
        return cardsR250;
      default:
        return cardsA100
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
          <option value="A100">A100</option>
          <option value="A200">A200</option>
          <option value="W60">W60</option>
          <option value="R250">R250</option>
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
