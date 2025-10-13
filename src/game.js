const game = {
    gameTurn: 0,

    playWord(player) {
        // Sort the orthogonal of the letters placed or report error
        let placed = rack.lettersPlaced[player];
        let placedObj = this.sortPlacedTiles(placed);
        if (placedObj.error) return;
        let orthogonal = placedObj.orthogonal;
        
        // Check for gaps of the orthogonal
        let error = board.checkOrthogonalGaps(placed, orthogonal);
        if (error != "") {
            this.statusReport(error);
            return;
        }

        if (gameTurn > 0) {
            // Check that word is joined to own colour
            // error = board.checkWordJoins(placed, orthogonal)

            // Collect new words and crossed words
            // Check for existence of new words

            // Change the colour and player settings to the player
            // board.changeColours(newWords, crossedWords);
        }
        else {
            // Check that the first word exists
        }    

        // Clear the temp flags from the board letters
        // board.clearTemp(placed);

        // Refill the rack
        // rack.replenish(0);

        // Computer Play
        // this.computerPlay();

        ++this.gameTurn;
    },

    sortPlacedTiles(placed) {
        let errorObj = {error: true};
        let orthogonal = "";
        if (placed.length > 1) {
            // Determine whether vertical or horizontal
            if (placed[0].cellX === placed[1].cellX) {
                orthogonal = "vertical";
                // Check that all tiles are on the same orthogonal
                if (placed.length > 2) {
                    for (let item of placed) {
                        if (item.cellX != placed[0].cellX) {
                            this.statusReport("Letters must be on the same row or column");
                            return errorObj;
                        }
                    }
                }
                placed.sort((a,b) => a.cellY - b.cellY);
            }
            else if (placed[0].cellY === placed[1].cellY) {
                orthogonal = "horizontal";
                // Check that all tiles are on the same orthogonal
                if (placed.length > 2) {
                    for (let item of placed) {
                        if (item.cellY != placed[0].cellY) {
                            this.statusReport("Letters must be on the same row or column");
                            return errorObj;
                        }
                    }
                }
                placed.sort((a,b) => a.cellX - b.cellX);
            }
            else {
                this.statusReport("Letters must be on the same row or column");
                return errorObj;
            }
        }
        return {error: false, orthogonal: orthogonal};
    },

    statusReport (message) {
        let statusDiv = document.getElementById("statusDiv");
        statusDiv.style.display = "block";
        statusDiv.innerText = message;
        setTimeout(() => {
            statusDiv.style.display = "none";
        }, 8000);
    }

}