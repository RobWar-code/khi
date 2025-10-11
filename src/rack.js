const rack = {
    currentRackTile: -1,

    displayTiles() {
        for (let rackTileNum = 0; rackTileNum < tileSet.rackLength; rackTileNum++) {
            this.displayTile(rackTileNum);
        }
    },

    displayTile (rackTileNum) {
        // Get letter
        const letter = tileSet.racks[0][rackTileNum];
        // Set the rack cell
        let rackCell = document.getElementById(`rackCell${rackTileNum}`);
        rackCell.innerHTML = "";
        rackCell.innerHTML = `<div class="rackLetterDiv">${letter}</div>`;
    }
}