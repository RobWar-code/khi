const board = {
// Constants
    boardWidth: 19,
    boardHeight: 19,
    starCell1: 0,
    starCell2: 0,
    starCellX0: 0,
    starCellY0: 0,
    starCellX1: 0,
    starCellY1: 0,

    boardData: [],
    positions: [],
    positionNum: 0,

    initBoard() {
        this.buildBoard();
        this.initBoardData();
    },

    buildBoard() {
        let boardElem = document.getElementById("board");
        let html = "";
        let cellNum = 0;
        this.starCellY0 = Math.floor(this.boardHeight/2);
        this.starCellX0 = 0;
        this.starCellY1 = this.starCellY0;
        this.starCellX1 = this.boardWidth - 1;
        this.starCell1 = this.starCellY0 * this.boardWidth;
        this.starCell2 = this.starCell1 + this.boardWidth - 1;
        for (let row = 0; row < this.boardWidth; row++) {
            html += "<tr>";
            for (let col = 0; col < this.boardHeight; col++) {
                html += `<td class="boardCell" id="cell${cellNum}" onclick="board.cellClicked(event)">`;
                if (cellNum === this.starCell1 || cellNum === this.starCell2) {
                    html += `<img src="assets/boardStar3.png" width="16" height="16">`;
                }
                html += "</td>";
                ++cellNum;
            }
            html += "</tr>";
        }
        boardElem.innerHTML = html;
    },

    initBoardData() {
        this.boardData = [];
        for (let i = 0; i < this.boardHeight; i++) {
            let boardRow = [];
            for (let j = 0; j < this.boardWidth; j++) {
                let cell = {
                    letter: "",
                    starTile: false,
                    playerNum: -1,
                    temp: false,
                    lastCompLay: false,
                };
                boardRow.push(cell);
            }
            this.boardData.push(boardRow);
        }
    },

    cellClicked(event) {
        cellId = event.currentTarget.id;
        cellNum = parseInt(cellId.substring(4));
        cellY = Math.floor(cellNum / this.boardWidth);
        cellX = cellNum % this.boardWidth;

        // Check whether the cell already contains a letter
        if (this.boardData[cellY][cellX].letter != "") {
            // Check whether the tile is temporary
            if (this.boardData[cellY][cellX].temp) {
                // Return the tile to rack
                rack.returnTile(this.boardData[cellY][cellX])
                // Clear the cell
                this.clearCell(cellX, cellY);
            }
            return;
        }

        // Check whether a rack tile is current
        if (rack.currentRackTile < 0) {
            return;
        }


        // Do the rack actions
        rack.playTile(cellX, cellY);

    },

    setTempTile(cellX, cellY, letter, starTile) {
        let cellItem = {
            letter: letter,
            starTile: starTile,
            playerNum: 0,
            temp: true,
            lastCompLay: false,
        };
        this.boardData[cellY][cellX] = cellItem;

        this.displayTile(cellX, cellY);
    },

    displayBoard() {
        for (let cellY = 0; cellY < this.boardHeight; cellY++) {
            for (let cellX = 0; cellX < this.boardWidth; cellX++) {
                this.displayTile(cellX, cellY);
            }
        }
    },

    displayTile(cellX, cellY) {
        let item = this.boardData[cellY][cellX];
        let background = "rgba(0,0,0,0)";
        if (item.temp) {
            background = "#f0a0a0";
        }
        else if (item.lastCompLay) {
            background = "#a04040";
        }
        let letter = item.letter;

        let tileClass = "boardTileBlue";
        if (item.playerNum === 1) tileClass = "boardTileBlack";

        let cellNum = cellY * this.boardWidth + cellX;
        let cellId = "cell" + cellNum;
        let cellElem = document.getElementById(cellId);
        cellElem.style.backgroundColor = background;
        cellElem.innerHTML = `<div class="${tileClass}">${letter}</div>`;

    },

    clearTemp() {
        // Clear player tile highlights
        let placed = rack.lettersPlaced[0];
        for (let item of placed) {
            let cellX = item.cellX;
            let cellY = item.cellY;
            this.boardData[cellY][cellX].temp = false;
            this.displayTile(cellX, cellY);
        }
        // Clear computer tile highlights
        placed = rack.lettersPlaced[1];
        for (let item of placed) {
            let cellX = item.cellX;
            let cellY = item.cellY;
            this.boardData[cellY][cellX].lastCompLay = false;
            this.displayTile(cellX, cellY);
        }
    },

    changeColours(wordSet, playerNum) {
        for (let wordItem of wordSet) {
            let startX = wordItem.startX;
            let endX = wordItem.endX;
            let startY = wordItem.startY;
            let dy = 0;
            let dx = 0;
            if (startX === endX) dy = 1;
            else dx = 1;
            let cellX = startX;
            let cellY = startY;
            let word = wordItem.word;
            for (let i = 0; i < word.length; i++) {
                this.boardData[cellY][cellX].playerNum = playerNum;
                this.displayTile(cellX, cellY);
                cellX += dx;
                cellY += dy;
            }
        }
    },

    clearCell(cellX, cellY) {
        let cellItem = {
            letter: "",
            starTile: false,
            playerNum: -1,
            temp: false,
            lastCompLay: false,
        };
        this.boardData[cellY][cellX] = cellItem;

        let cellNum = cellY * this.boardWidth + cellX;
        let cellId = "cell" + cellNum;
        let cellElem = document.getElementById(cellId);
        cellElem.innerHTML = "";
        if (cellNum === this.starCell1 || cellNum === this.starCell2) {
            // Show star start symbol
            cellElem.innerHTML = `<img src="assets/boardStar3.png" width="16" height="16">`;
        }
        cellElem.style.backgroundColor = "rgba(0,0,0,0)";
    },

    getNextPlayPosition() {
        if (this.positionNum >= this.positions.length) {
            return {found: false}
        }
        else {
            let position = this.positions[this.positionNum++];
            return {found: true, position: position};
        }
    },

    getPlayPositionsList(playerNum) {
        this.positionNum = 0;
        this.positions = [];

        // Get the number of positions required
        let numPositions = 8;
        if (game.level < 2) {
            numPositions = 20;
        }

        // Get Each Cell Position
        let ix;
        let positionsList = [];
        let positionCellY = -1;
        let positionCellX = 0;
        let gotEdge = false;
        let ownTileFound = true;
        let count = 0;
        while (!gotEdge && count < numPositions && ownTileFound) {
            let cellObj = this.findNextOwnCell(playerNum, positionCellX, positionCellY);
            if (cellObj.gotEdge || !cellObj.ownTileFound) {
                gotEdge = true;
                ownTileFound = false;
            }
            else {
                positionCellX = cellObj.cellX;
                positionCellY = cellObj.cellY;
                let item = {
                    cellX: cellObj.cellX,
                    cellY: cellObj.cellY,
                    validCells: cellObj.validCells
                }
                positionsList.push(item);
                ++count;
            }
        }
        if (count > 0) {
            if (game.gameLevel === 1) {
                this.positions = positionsList;
            }
            else {
                // Select upto five items from the positions
                // Get array of indices to shuffle
                ix = [];
                for (let i = 0; i < count; i++) {
                    ix.push(i);
                }
                // Shuffle
                for (let i = 0; i < count; i++) {
                    let a = ix[i];
                    let p = Math.floor(Math.random() * count);
                    ix[i] = ix[p];
                    ix[p] = a;
                }
                // Build the positions list
                let limit = 5;
                if (game.gameLevel === 0) limit = 3;
                if (count < limit) limit = count;
                for (let i = 0; i < limit; i++) {
                    let p = ix.pop();
                    this.positions.push(JSON.parse(JSON.stringify(positionsList[p])));
                }
            }
        }
    },

    findNextOwnCell(playerNum, positionCellX, positionCellY) {

        const adj = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];
        let validCells = [
            // {cellX, cellY}
        ];
        // Look for own tile that can be joined to.
        // most leftward order first.
        let ownTileFound = false;
        let gotEdge = false;
        while (!ownTileFound && !gotEdge) {
            // Get next cell
            ++positionCellY;
            if (positionCellY >= this.boardHeight) {
                positionCellY = 0;
                ++positionCellX;
                if (positionCellX >= this.boardWidth) gotEdge = true;
            }
            if (!gotEdge) {
                // If own tile
                if (this.boardData[positionCellY][positionCellX].playerNum === playerNum) {
                    // Check the adjacent squares
                    for (let adjItem of adj) {
                        let cellX = positionCellX + adjItem[0];
                        let cellY = positionCellY + adjItem[1];
                        if (cellX >= 0 && cellX < this.boardWidth && cellY >= 0 && cellY < this.boardHeight) {
                            // Check whether empty cell
                            if (this.boardData[cellY][cellX].letter === "") {
                                validCells.push({cellX: cellX, cellY: cellY});
                            }
                        }
                    }
                    if (validCells.length > 0) {
                        ownTileFound = true;
                    }
                }
            }
        }
        return {gotEdge: gotEdge, ownTileFound: ownTileFound, cellX: positionCellX, 
            cellY: positionCellY, validCells: validCells}
    },

    checkOrthogonalGaps(placed, orthogonal) {
        let error = "";
        let len = placed.length;
        if (len === 1) return;

        let coord = [];
        if (orthogonal === "horizontal") {
            coord[0] = "cellY";
            coord[1] = "cellX";
        }
        else {
            coord[0] = "cellX";
            coord[1] = "cellY";           
        }
        let orthogCoord = placed[0][coord[0]];
        let index = 0;
        let lastStepCoord = -1;
        for (let tile of placed) {
            let stepCoord = tile[coord[1]];
            if (index > 0) {
                if (stepCoord - lastStepCoord > 1) {
                    // Check the board for a letter;
                    if (orthogonal === "horizontal") {
                        for (let x = lastStepCoord + 1; x < stepCoord; x++) {
                            if (this.boardData[orthogCoord][x].letter === "") {
                                error = "There is a gap in the letters you've placed";
                                return error;
                            }
                        }
                    }
                    else {
                        for (let y = lastStepCoord + 1; y < stepCoord; y++) {
                            if (this.boardData[y][orthogCoord].letter === "") {
                                error = "There is a gap in the letters you've placed";
                                return error;
                            }
                        }
                    }
                }
            }
            lastStepCoord = stepCoord;
            ++index;
        }
        return "";
    },

    checkWordJoins(placed, playerNum) {
        let adj = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ];
        let joins = [];
        let ownJoin = false;
        let index = 0;
        for (let item of placed) {
            let cellX = item.cellX;
            let cellY = item.cellY;
            // Check neighbouring cells
            for (let adjcell of adj) {
                let ax = adjcell[0];
                let ay = adjcell[1];
                let x = cellX + ax;
                let y = cellY + ay;
                if (x >= 0 && x < this.boardWidth && y >= 0 && y < this.boardHeight) {
                    let cell = this.boardData[y][x];
                    if (cell.letter != "" && cell.temp === false) {
                        let ownJoinSet = false;
                        if (cell.playerNum === playerNum) {
                            ownJoin = true;
                            ownJoinSet = true;
                        }
                        joins.push({
                            placedIndex: index,
                            adjCell: adjcell,
                            ownJoin: ownJoinSet
                        });
                    }
                }
            }
            ++index;
        }
        return {joins: joins, ownJoin: ownJoin};
    },

    getJoins (cellX, cellY) {
        let adj = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ];
        let joins = [];
        for (let adjcell of adj) {
            let ax = adjcell[0];
            let ay = adjcell[1];
            let x = cellX + ax;
            let y = cellY + ay;
            if ((x >= 0 && x < this.boardWidth) && (y >= 0 && y < this.boardHeight)) {
                let cell = this.boardData[y][x];
                if (cell.letter != "" && cell.temp === false) {
                    joins.push({
                        x: x,
                        y: y,
                        adjCell: adjcell
                    });
                }
            }
        }
        return joins;
    },

    extractWords(placed, joins, orthogonal) {
        let newWords = [];
        let crossedWords = [];
        let joinsDone = new Array(joins.length).fill(false);
        let index = 0;
        for (let join of joins) {
            if (!joinsDone[index]) {
                let placedIndex = join.placedIndex;
                let cellX = placed[placedIndex].cellX;
                let cellY = placed[placedIndex].cellY;
                let adjCell = join.adjCell;
                let joinDirection = "vertical";
                if (adjCell[0] != 0) joinDirection = "horizontal";
                // Check for crossed word
                if (joinDirection === orthogonal) {
                    // Check there is more than one letter
                    // on the connected rightangle
                    let x = cellX + adjCell[0];
                    let y = cellY + adjCell[1];
                    let direction = joinDirection === "horizontal" ? "vertical" : "horizontal";
                    let wordObj = this.scanWord(x, y, direction);
                    if (wordObj.word.length > 1) {
                        crossedWords.push(wordObj);
                    }
                }
                else {
                    // Check for new words (those that join through the player's letters)
                    let direction = orthogonal === "horizontal" ? "vertical" : "horizontal";
                    let wordObj = this.scanWord(cellX, cellY, direction);
                    if (wordObj.word.length > 1) {
                        newWords.push(wordObj);
                    }
                    // Flag out the opposite side of the join (if present)
                    for (let i = index + 1; i < joins.length && i < index + 2; i++) {
                        if (joins[i].placedIndex === join.placedIndex) joinsDone[i] = true;
                    }
                }
            }
            ++index;
        }

        // Scan Primary Word
        let x = placed[0].cellX;
        let y = placed[0].cellY;
        let wordObj = this.scanWord(x, y, orthogonal);
        newWords.push(wordObj);


        return {newWords: newWords, crossedWords: crossedWords};
    },

    setComputerWord() {
        let placed = rack.lettersPlaced[computer.playerNum];
        for (let item of placed) {
            let cellX = item.cellX;
            let cellY = item.cellY;
            this.boardData[cellY][cellX] = {
                letter: item.letter.toUpperCase(),
                starTile: false,
                playerNum: computer.playerNum,
                temp: false,
                lastCompLay: true
            };
            this.displayTile(cellX, cellY);
        }
        if (game.gameTurn > 0) {
            // Claim adjoining words
            this.changeColours(computer.hiNewWords, computer.playerNum);
            this.changeColours(computer.hiCrossWords, computer.playerNum);
        }
    },

    scanWord(x, y, direction) {
        let word = this.boardData[y][x].letter;
        let blueCount = 0;
        let blackCount = 0;
        if (this.boardData[y][x].playerNum === 0) ++blueCount;
        else ++blackCount;
        let startX = -1;
        let startY = -1;
        let endX = -1;
        let endY = -1;
        let step = [-1, 1];
        for (let i = 0; i < 2; i++) {
            let noLetter = false;
            let edge = false;
            let ny = y;
            let nx = x;
            while(!noLetter && !edge) {
                let oldnx = nx;
                let oldny = ny;
                if (direction === "horizontal") {
                    nx += step[i];
                }
                else {
                    ny += step[i];
                }
                if (nx < 0 || nx >= this.boardWidth || ny < 0 || ny >= this.boardWidth) {
                    edge = true;
                    if (i === 0) {
                        startX = oldnx;
                        startY = oldny;
                    }
                    else {
                        endX = oldnx;
                        endY = oldny;
                    }
                }
                else {
                    let letter = this.boardData[ny][nx].letter;
                    let playerNum = this.boardData[ny][nx].playerNum;
                    if (letter === "") {
                        noLetter = true;
                        if (i === 0) {
                            startX = oldnx;
                            startY = oldny;
                        }
                        else {
                            endX = oldnx;
                            endY = oldny;
                        }
                    }
                    else {
                        playerNum === 0 ? ++blueCount : ++blackCount; 
                        if (step[i] === -1) {
                            word = letter + word;
                        }
                        else {
                            word += letter;
                        }
                    }
                }
            }
        }
        return {word: word, startX: startX, endX: endX, startY: startY, endY: endY, 
            blueCount: blueCount, blackCount: blackCount};
    },

    getTileScores() {
        let scores = [0, 0];
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                let item = this.boardData[y][x];
                if (item.letter != "") {
                    let playerNum = item.playerNum;
                    ++scores[playerNum];
                }
            }
        }
        return scores; 
    },

    /**
     * Return all temporary player tiles to the rack
     */
    returnPlayerTiles() {
        for (let cellY = 0; cellY < this.boardHeight; cellY++) {
            for (let cellX = 0; cellX < this.boardWidth; cellX++) {
                let cell = this.boardData[cellY][cellX];
                if (cell.temp) {
                    rack.returnTile(cell);
                    this.clearCell(cellX, cellY);
                }
            }
        }
    }
}
