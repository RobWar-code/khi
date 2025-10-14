const game = {
    gameTurn: 0,

    playWord(player) {
        // If this is first turn, ensure that a tile is on the start square
        if (this.gameTurn === 0) {
            let found = rack.checkForTileOnStartSquare();
            if (!found) {
                let message = "On the first turn a tile must be placed on the left star square";
                this.statusReport(message);
                return;
            }
        }

        let orthogonal = "";
        let placed = rack.lettersPlaced[player];
        if (this.gameTurn > 0 && placed.length === 1) {
            // Find the join direction
            let cellX = placed[0].cellX;
            let cellY = placed[0].cellY;
            let joins = board.getJoins(cellX, cellY);
            if (joins.length === 0) {
                let message = "Letter is not joined to other words";
                this.statusReport(message);
                return;
            }
            let adjCell = joins[0].adjCell;
            orthogonal = adjCell[0] === 0 ? "vertical" : "horizontal";
        }
        // else - allow for single letter on gameTurn === 0

        // Sort the orthogonal of the letters placed or report error
        let placedObj = this.sortPlacedTiles(placed);
        if (placedObj.error) return;
        orthogonal = placedObj.orthogonal;
        
        // Check for gaps of the orthogonal
        let error = board.checkOrthogonalGaps(placed, orthogonal);
        if (error != "") {
            this.statusReport(error);
            return;
        }

        if (this.gameTurn > 0) {
            // Check that word is joined to own colour
            const {joins, ownJoin} = board.checkWordJoins(placed, player);
            if (joins.length === 0) {
                let message = "Your word must join another word on the board";
                this.statusReport(message);
                return;
            }

            if (!ownJoin) {
                let message = "Your word must join at least one tile of your own";
                this.statusReport(message);
            }

            // Collect new words and crossed words
            const {newWords, crossedWords} = board.extractWords(placed, joins, orthogonal);
            console.log("newWords:", newWords);
            console.log("crossedWords:", crossedWords);

            // Check for existence of new words

            // Change the colour and player settings to the player
            // board.changeColours(newWords, crossedWords);
        }
        else {
            // Check that the first word exists
            // Get word from letters placed
            let word = "";
            for (let item of placed) {
                word += item.letter;
            }
            let found = wordFuncs.indexFindWord(word);
            if (!found) {
                let message = word + " is not a valid word";
                this.statusReport(message);
                return;
            }
        }
        
        // Check for winning tile
        // this.hasWinningTile(placed);

        // Clear the temp flags from the board letters
        board.clearTemp(placed);

        // Refill the rack
        let endOfGame = rack.replenish(0);

        // Computer Play
        // computer.play();

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