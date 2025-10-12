
const rack = {
    rackLength: 7,
    racks: [],
    currentRackTile: -1,
    starCellX: -1,  // Holding for star cell letter selection
    starCellY: -1,
    lettersPlaced: [[],[]],

    fillRacks() {
        this.racks = [];
        for (let i = 0; i < 2; i++) {
            let rack = [];
            for (let j = 0; j < this.rackLength; j++) {
                let l = tileSet.tileHold.pop();
                rack.push(l);
            }
            this.racks.push(rack);
        }
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
    },

    tileClick (event) {
        let tileId = event.currentTarget.id;
        let tileNum = parseInt(tileId.substring(tileId.length - 1));
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
        if (letter === "*") {
            document.getElementById("starLetterDiv").style.display = "block";
            this.starCellX = cellX;
            this.starCellY = cellY;
            return;
        }

        // Update the letters placed
        this.updateLettersPlaced(cellX, cellY);

        // Clear the rack tile cell
        let rackCell = document.getElementById(`rackCell${this.currentRackTile}`);
        rackCell.innerHTML = "";
        rackCell.style.backgroundColor = "#e0c040";

        let star = false;
        board.setTempTile(cellX, cellY, letter, star);

        this.currentRackTile = -1;
    },

    updateLettersPlaced(cellX, cellY) {
        let placedItem = {
            letter: this.racks[0][this.currentRackTile],
            cellX: cellX,
            cellY: cellY,
            rackCell: this.currentRackTile
        };
        this.lettersPlaced[0].push(placedItem);
    },

    selectStarLetter(event) {
        let letter = event.currentTarget.innerText;
 
        // Update the letters placed
        this.updateLettersPlaced(cellX, cellY);

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
        let letter = cellData.letter;
        if (cellData.starTile) letter = "*";
        // Remove and get the placed letter
        // Find the placed letter
        let found = false;
        let temp = [];
        let rackCell = -1;
        for (let i = 0; i < this.lettersPlaced[0].length; i++) {
            if (this.lettersPlaced[0][i].letter === letter) {
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
        this.displayTile(rackCell);

    }
}