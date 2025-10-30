const game = {
    userNum: 0,
    winBonus: 10,
    gameTurn: 0,
    penalties: [0, 0],
    passCount: 0,
    winner: -1,

    playWord(player) {
        let gotWin = false;
        let endOfGame = false;

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
        if (this.gameTurn === 0 && placed.length === 1) {
            let message = "You must make at least a two-letter word";
            this.statusReport(message);
            return;
        }
        else if (this.gameTurn > 0 && placed.length === 1) {
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
        else if (placed.length > 1) {
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
        }

        if (this.gameTurn > 0) {
            // Check that word is joined to own colour
            const {joins, ownJoin} = board.checkWordJoins(placed, player);
            console.log("playWord: joins, ownJoin", joins, ownJoin);
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
            console.log("playWord: - newWords", newWords);
            console.log("playWord: - crossedWords", crossedWords);

            // Check for existence of new words
            let invalidList = wordFuncs.validateWords(newWords);
            if (invalidList.length > 0) {
                let message = "The following words are invalid: ";
                let start = true;
                for (let word of invalidList) {
                    if (!start) message += ", ";
                    message += word;
                    start = false;
                }
                this.statusReport(message);
                return;
            }

            // Change the colour and player settings to the player
            board.changeColours(newWords, player);
            board.changeColours(crossedWords, player);

            // Check for winning tile
            gotWin = this.gameWon(newWords);
            if (!gotWin) gotWin = this.gameWon(crossedWords);
            if (gotWin) winner = this.userNum;

        }
        else {
            // Check that the first word exists
            // Get word from letters placed
            let word = "";
            for (let item of placed) {
                word += item.letter;
            }
            let foundObj = wordFuncs.indexFindWord(word);
            let found = foundObj.found;
            if (!found) {
                let message = word + " is not a valid word";
                this.statusReport(message);
                return;
            }
        }
        

        // Clear the temp flags from the board letters
        board.clearTemp();

        // Refill the rack
        endOfGame = rack.replenish(this.userNum);

        // Computer Play
        if (!endOfGame && !gotWin) {
            // Allow for too many changes or passes
            let endObj = computer.play();
            gotWin = endObj.gotWin;
        }

        if (!gotWin && !endOfGame) {
            // Display the current scores
            this.displayCurrentScores();
        }
        else {
            // Display the end of game panel etc.
            this.doEndOfGame();
        }

        ++this.gameTurn;
    },

    sortPlacedTiles(placed) {
        let errorObj = {error: true};
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
        else {
            // Single tile, get the orthogonal from the first join
            let cellX = placed[0].cellX;
            let cellY = placed[0].cellY;
            orthogonal = "horizontal";
            let scanObj = board.scanWord(cellX, cellY, orthogonal);
            if (scanObj.word.length === 1) {
                orthogonal === "vertical";
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
    },

    displayCurrentScores() {
        let scoreSet = board.getTileScores();
        // Deduct Penalties
        for (let i = 0; i < 2; i++) {
            scoreSet[i] -= game.penalties[i];
        }
        // Display
        document.getElementById("scoresDiv").style.display = "block";
        document.getElementById("playerScore").innerText = scoreSet[0];
        document.getElementById("computerScore").innerText = scoreSet[1];
    },

    gameWon(wordSet) {
        // Check through the word set for edge tile
        let found = false;
        for (let item of wordSet) {
            if (wordSet.endX === board.boardWidth - 1) {
                found = true;
                break;
            }
        }
        return found;
    },

    doEndOfGame() {
        document.getElementById("gameEndDiv").style.display = "block";
        document.getElementById("playOptionsDiv").style.display = "none";
        document.getElementById("scoresDiv").style.display = "none";

        let totalScores = [0, 0];
        // Get the tile scores
        let tileScores = board.getTileScores();
        document.getElementById("tileScore0").innerText = tileScores[0];
        document.getElementById("tileScore1").innerText = tileScores[1];
        totalScores[0] += tileScores[0];
        totalScores[1] += tileScores[1];

        // Penalties
        document.getElementById("penalty0").innerText = -this.penalties[0];
        document.getElementById("penalty1").innerText = -this.penalties[1];
        totalScores[0] -= this.penalties[0];
        totalScores[1] -= this.penalties[1];

        // Bonus
        let bonus = [0,0]
        if (this.winner >= 0) {
            bonus[this.winner] = this.winBonus;
        }
        document.getElementById("bonus0").innerText = bonus[0];
        document.getElementById("bonus1").innerText = bonus[1];
        totalScores[0] += bonus[0];
        totalScores[1] += bonus[1];

        // Totals
        document.getElementById("totalScore0").innerText = totalScores[0];
        document.getElementById("totalScore0").innerText = totalScores[0];

        // Do Message
    }

}