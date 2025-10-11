
const rack = {
    rackLength: 7,
    racks: [],
    currentRackTile: -1,

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
        console.log("tileId:", tileId);
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
        console.log("cellId:", cellId);
        document.getElementById(cellId).style.backgroundColor = "#50b050"; 
    },

    clearRackCellHighlight(cellNum) {
        let cellId = "rackCell" + cellNum;
        document.getElementById(cellId).style.backgroundColor = "#e0c040"; 
    }
}