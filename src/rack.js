
const rack = {
    rackLength: 7,
    racks: [], // Arrays of letters
    rackNumChars: [0, 0],
    currentRackTile: -1,
    starCellX: -1,  // Holding for star cell letter selection
    starCellY: -1,
    lettersPlaced: [[],[]], // {rackCell, cellX, cellY, letter}
    // Debug
    playerTestRacks: [
        ["H","E","A","T","E","R","S"],
        ["E","A","S","Y","W","Z","Q"]
    ],

    fillRacks() {
        this.racks = [];
        for (let i = 0; i < 2; i++) {
            let rack = [];
            for (let j = 0; j < this.rackLength; j++) {
                let l = tileSet.tileHold.pop();
                rack.push(l);
            }
            this.racks.push(rack);
            this.rackNumChars[i] = this.rackLength;
        }
        // Debug
        // this.racks[0] = this.playerTestRacks[0];
    },

    displayTiles() {
        for (let rackTileNum = 0; rackTileNum < this.rackLength; rackTileNum++) {
            this.displayTile(rackTileNum);
        }
    },

    displayTile (rackTileNum) {
        // Get letter
        const letter = this.racks[0][rackTileNum];
        // Set the rack cell
        let rackCell = document.getElementById(`rackCell${rackTileNum}`);
        rackCell.innerHTML = "";
        rackCell.innerHTML = `<div class="rackLetterDiv">${letter}</div>`;
        if (rackTileNum === this.currentRackTile) {
            this.setRackCellHighlight(rackTileNum);
        }
        else {
            this.clearRackCellHighlight(rackTileNum);
        }
    },

    tileClick (event) {
        let tileId = event.currentTarget.id;
        let tileNum = parseInt(tileId.substring(tileId.length - 1));
        // Check whether this tile has been played
        let found = false;
        for (let item of this.lettersPlaced[game.userNum]) {
            if (item.rackCell === tileNum) {
                found = true;
                break;
            }
        }
        if (found || this.racks[game.userNum][tileNum] === "") return;

        if (this.currentRackTile > -1) {
            // Clear the highlight from the current tile
            this.clearRackCellHighlight(this.currentRackTile);
        }
        // Set the current rack cell
        this.currentRackTile = tileNum;
        this.setRackCellHighlight(tileNum);
    },

    setRackCellHighlight(cellNum) {
        let cellId = "rackCell" + cellNum;
        document.getElementById(cellId).style.backgroundColor = "#50b050"; 
    },

    clearRackCellHighlight(cellNum) {
        let cellId = "rackCell" + cellNum;
        document.getElementById(cellId).style.backgroundColor = "#e0c040"; 
    },

    playTile(cellX, cellY) {
        let letter = this.racks[0][this.currentRackTile];

        // Check whether the rack tile is a *
        let isStar = false;
        if (letter === "*") {
            isStar = true;
            document.getElementById("starLetterDiv").style.display = "block";
            this.starCellX = cellX;
            this.starCellY = cellY;
            return;
        }

        // Update the letters placed
        this.updateLettersPlaced(cellX, cellY, letter, isStar);

        // Clear the rack tile cell
        let rackCell = document.getElementById(`rackCell${this.currentRackTile}`);
        rackCell.innerHTML = "";
        rackCell.style.backgroundColor = "#e0c040";

        let star = false;
        board.setTempTile(cellX, cellY, letter, star);

        this.currentRackTile = -1;
    },

    updateLettersPlaced(cellX, cellY, letter, isStar) {
        let placedItem = {
            letter: letter,
            isStar: isStar,
            cellX: cellX,
            cellY: cellY,
            rackCell: this.currentRackTile
        };
        this.lettersPlaced[0].push(placedItem);
    },

    selectStarLetter(event) {
        let letter = event.currentTarget.innerText;
 
        // Update the letters placed
        let isStar = true;
        this.updateLettersPlaced(cellX, cellY, letter, isStar);

        // Clear the rack tile cell
        let rackCell = document.getElementById(`rackCell${this.currentRackTile}`);
        rackCell.innerHTML = "";
        rackCell.style.backgroundColor = "#e0c040";

        let star = true;
        board.setTempTile(cellX, cellY, letter, star);

        document.getElementById("starLetterDiv").style.display = "none";
        this.currentRackTile = -1;
    },

    returnTile(cellData) {
        let isStar = false;
        let letter = cellData.letter;
        if (cellData.starTile) {
            isStar = true;
            letter = "*";
        }
        // Remove and get the placed letter
        // Find the placed letter
        let found = false;
        let temp = [];
        let rackCell = -1;
        for (let i = 0; i < this.lettersPlaced[0].length; i++) {
            if (!found && (this.lettersPlaced[0][i].letter === letter || (isStar && this.lettersPlaced[0][i].isStar))) {
                found = true;
                rackCell = this.lettersPlaced[0][i].rackCell;
            }
            else {
                temp.push(this.lettersPlaced[0][i]);
            }
        }
        if (!found) {
            console.error("Board tile not matched in rack");
            throw "Program Error";
        }
        this.lettersPlaced[0] = temp;

        // Add the letter back to the rack
        if (this.currentRackTile >= 0) this.clearRackCellHighlight(this.currentRackTile);
        this.currentRackTile = rackCell;
        this.displayTile(rackCell);

    },

    checkForTileOnStartSquare() {
        let found = false;
        for (let item of this.lettersPlaced[0]) {
            if (item.cellX === board.starCellX0 && item.cellY === board.starCellY0) {
                found = true;
                break;
            }
        }
        return found;
    },

    replenish (playerNum) {
        let endOfGame = false;
        let placed = this.lettersPlaced[playerNum];
        let index = 0;
        for (let item of placed) {
            let rackCell = item.rackCell;
            // Choose a letter from the tileSet
            let letter = "";
            if (tileSet.tileHold.length > 0) {
                letter = tileSet.tileHold.pop();
            }
            this.racks[playerNum][rackCell] = letter;
            ++index;
        }

        // Check whether there are any tiles in the rack
        let letterCount = 0;
        for (let letter of this.racks[playerNum]) {
            if (letter === "") ++letterCount;
        }
        this.rackNumChars[playerNum] = this.rackLength - letterCount;
        if (letterCount >= this.rackLength) {
            endOfGame = true;
        }

        // Debug
        /*
        if (game.gameTurn === 0 && playerNum === 0) {
            this.racks[0] = this.playerTestRacks[1];
        }
        */

        if (playerNum === 0) {
            this.displayTiles();
        }

        // Cleared placed items list
        if (playerNum === 0) this.lettersPlaced[playerNum] = [];
        this.currentRackTile = -1;

        return endOfGame;
    },

    changeTiles(playerNum) {
        // Check that there are enough tiles in the hold
        if (tileSet.tileHold.length <= 1) {
            let message = "The tile hold is empty so you cannot change tiles - try Pass";
            game.statusReport(message);
            return false;
        }

        // if playerNum === 0; clear any played tiles from the board
        if (playerNum === game.userNum) {
            board.returnPlayerTiles();
        }

        // Change the tiles
        let rack = this.racks[playerNum];
        let newRack = tileSet.changeTiles(rack);
        this.racks[playerNum] = newRack;

        // Add the penalty
        game.penalties[playerNum] += 10;

        // If playerNum === 0; re-display the rack
        if (playerNum === game.userNum) {
            this.currentRackTile = -1;
            this.displayTiles();
            // Redisplay the scores
            if (game.gameTurn > 0) {
                game.displayCurrentScores();
            }
        }
        return true;
    }
}