import { CELL_VALUE, GAME_STATUS, TURN } from "./constants.js";
import {
    getCellElementList,
    getCurrentTurnElement,
    getCellElementAtIdx,
    getGameStatusElement,
    getReplayButtonElement,
} from "./selectors.js";
import { checkGameStatus } from "./utils.js";

console.log(checkGameStatus(["X", "O", "O", "", "X", "", "", "O", "X"]));

/**
 * Global variables
 */
let currentTurn = TURN.CROSS;
let gameStatus = GAME_STATUS.PLAYING;
let cellValues = new Array(9).fill("");

// switch turn after every move
function toggleTurn() {
    // toggle turn
    currentTurn = currentTurn === TURN.CIRCLE ? TURN.CROSS : TURN.CIRCLE;

    // update turn on DOM element
    const currentTurnElement = getCurrentTurnElement();
    if (currentTurnElement) {
        currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
        currentTurnElement.classList.add(currentTurn);
    }
}

function updateGameStatus(newGameStatus) {
    gameStatus = newGameStatus;

    const gameStatusElement = getGameStatusElement();
    if (gameStatusElement) gameStatusElement.textContent = newGameStatus;
}

function showReplayButton() {
    const replayButton = getReplayButtonElement();
    if (replayButton) replayButton.classList.add("show");
}

function hideReplayButton() {
    const replayButton = getReplayButtonElement();
    if (replayButton) replayButton.classList.remove("show");
}

function highlightWinCells(winPositions) {
    if (!Array.isArray(winPositions) || winPositions.length !== 3) {
        throw new Error("Invalid win position");
    }

    for (const position of winPositions) {
        const cell = getCellElementAtIdx(position);
        if (cell) cell.classList.add("win");
    }
}

function handleCellClick(cell, index) {
    // check cell is clicked or not before handle event
    const isClicked = cell.classList.contains(TURN.CIRCLE) || cell.classList.contains(TURN.CROSS);
    const isEndGame = gameStatus !== GAME_STATUS.PLAYING;
    if (isClicked || isEndGame) return;

    // set selected cell
    cell.classList.add(currentTurn);

    // update cellValues at index position after every move
    cellValues[index] = currentTurn === TURN.CIRCLE ? CELL_VALUE.CIRCLE : CELL_VALUE.CROSS;

    // toggle turn
    toggleTurn();

    // check game status
    const game = checkGameStatus(cellValues);
    switch (game.status) {
        case GAME_STATUS.ENDED: {
            updateGameStatus(game.status);
            showReplayButton();
            break;
        }

        case GAME_STATUS.X_WIN:
        case GAME_STATUS.O_WIN: {
            updateGameStatus(game.status);
            showReplayButton();
            highlightWinCells(game.winPositions);
            break;
        }

        default:
        // playing
    }
}

function initCellElementList() {
    const cellElementList = getCellElementList();
    cellElementList.forEach((cell, index) => {
        // attach event for each cell
        cell.addEventListener("click", () => handleCellClick(cell, index));
    });
}

function resetGame() {
    // reset global vars
    currentTurn = TURN.CROSS;
    gameStatus = GAME_STATUS.PLAYING;
    cellValues = cellValues.map(() => "");

    // reset DOM elements
    // reset game status
    updateGameStatus(GAME_STATUS.PLAYING);

    // reset current turn
    const currentTurnElement = getCurrentTurnElement();
    if (currentTurnElement) {
        currentTurnElement.classList.remove(TURN.CIRCLE, TURN.CROSS);
        currentTurnElement.classList.add(TURN.CROSS);
    }

    // reset game board
    const cellElementList = getCellElementList();
    for (const cell of cellElementList) {
        cell.className = "";
    }

    // hide replay button
    hideReplayButton();
}

function initReplayButton() {
    const replayButton = getReplayButtonElement();
    if (replayButton) replayButton.addEventListener("click", resetGame);
}

/**
 * TODOs
 *
 * 1. Bind click event for all cells
 * 2. On cell click, do the following:
 *    - Toggle current turn
 *    - Mark current turn to the selected cell
 *    - Check game state: win, ended or playing
 *    - If game is win, highlight win cells
 *    - Not allow to re-click the cell having value.
 *
 * 3. If game is win or ended --> show replay button.
 * 4. On replay button click --> reset game to play again.
 *
 */
(() => {
    // bind click event for all li elements
    initCellElementList();

    // bind click event for replay button
    initReplayButton();
})();
