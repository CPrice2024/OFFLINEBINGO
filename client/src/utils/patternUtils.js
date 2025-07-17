// patternUtils.js

// Constants for all pattern cells
const allCols = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
];

const allRows = [
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
];

const mainDiagonal = [0, 6, 12, 18, 24];
const antiDiagonal = [4, 8, 12, 16, 20];
const allCorners = [0, 4, 20, 24];

const firstAnyCornerSquare = [0, 1, 5, 6];
const secondAnyCornerSquare = [4, 8, 9, 3];
const thirdAnyCornerSquare = [20, 16, 15, 21];
const fourthAnyCornerSquare = [24, 18, 19, 23];

const middleCells = [6, 8, 16, 18];
const freeCell = 12;

// Helper function to generate combinations
function getCombinations(arrays, comboLength) {
  // Flatten any nested arrays first
  const flatArrays = arrays.map(arr => 
    Array.isArray(arr[0]) ? arr[0] : arr
  );

  const result = [];
  
  function combine(start = 0, path = []) {
    if (path.length === comboLength) {
      const flatPath = path.flat();
      // Only include valid combinations
      if (flatPath.every(cell => typeof cell === 'number' && !isNaN(cell))) {
        result.push(flatPath);
      }
      return;
    }
    for (let i = start; i < flatArrays.length; i++) {
      combine(i + 1, [...path, flatArrays[i]]);
    }
  }
  
  combine();
  return result;
}

// Validate pattern cells
function validatePatternCells(cells) {
  if (!Array.isArray(cells)) return false;
  return cells.every(cell => 
    typeof cell === 'number' && 
    !isNaN(cell) && 
    cell >= 0 && 
    cell <= 24
  );
}

// Main pattern function
export const getPatternCells = (pattern) => {
  if (!pattern || typeof pattern !== 'string') return [];
  
  const normalizedPattern = pattern.toLowerCase().trim();
  
  switch (normalizedPattern) {
    case "any vertical":
      return allCols;

    case "any 2 vertical":
      return getCombinations(allCols, 2);

    case "any horizontal":
      return allRows;

    case "any 2 horizontal":
      return getCombinations(allRows, 2);

    case "any 2 line":
      return getCombinations([...allRows, ...allCols, mainDiagonal, antiDiagonal], 2);

    case "any 3 line":
      return getCombinations([...allRows, ...allCols, mainDiagonal, antiDiagonal], 3);

    case "any diagonal":
      return [mainDiagonal, antiDiagonal];

    case "any line":
      return [...allRows, ...allCols, mainDiagonal, antiDiagonal];

    case "4 single middle":
      return [middleCells];

    case "all 4 corner square (single)":
    case "all 4 corner square(single)":
      return [allCorners];

    case "all 4 corner square(single) and any line":
      return [allCorners, ...allRows, ...allCols, mainDiagonal, antiDiagonal];

    case "any 1 corner square":
      return [firstAnyCornerSquare, secondAnyCornerSquare, 
              thirdAnyCornerSquare, fourthAnyCornerSquare];

    case "any 2 corner square":
      return getCombinations([
        firstAnyCornerSquare, 
        secondAnyCornerSquare, 
        thirdAnyCornerSquare, 
        fourthAnyCornerSquare
      ], 2);

    case "any 3 corner square":
      return getCombinations([
        firstAnyCornerSquare, 
        secondAnyCornerSquare, 
        thirdAnyCornerSquare, 
        fourthAnyCornerSquare
      ], 3);

    case "any 4 corner square":
      return [
        [...firstAnyCornerSquare, ...secondAnyCornerSquare, 
         ...thirdAnyCornerSquare, ...fourthAnyCornerSquare]
      ];

    case "4 inner & 4 outer":
      return [[...middleCells, ...allCorners]];

    default:
      return [];
  }
};

// Pattern validation utility
export const isValidPattern = (patternName) => {
  const validPatterns = [
    "any vertical", "any 2 vertical",
    "any horizontal", "any 2 horizontal",
    "any 2 line", "any 3 line",
    "any diagonal", "any line",
    "4 single middle",
    "all 4 corner square (single)",
    "all 4 corner square(single)",
    "all 4 corner square(single) and any line",
    "any 1 corner square", "any 2 corner square",
    "any 3 corner square", "any 4 corner square",
    "4 inner & 4 outer"
  ];
  return validPatterns.includes(patternName.toLowerCase().trim());
};

// Helper function to check if marked cells match a pattern
export const checkPatternMatch = (markedCells, patternName) => {
  if (!Array.isArray(markedCells)) return false;
  if (!isValidPattern(patternName)) return false;

  const patterns = getPatternCells(patternName);
  return patterns.some(pattern => 
    Array.isArray(pattern) && 
    pattern.every(cell => markedCells.includes(cell))
  );
};