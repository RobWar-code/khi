const board = {
// Constants
    boardWidth: 19,
    boardHeight: 19,
    starCell1: 0,
    starCell2: 0,

    boardData: [],

    initBoard() {
        this.buildBoard();
        this.initBoardData();
    },

    buildBoard() {
        let boardElem = document.getElementById("board");
        let html = "";
        let cellNum = 0;
        let starCellY = Math.floor(this.boardHeight/2);
        this.starCell1 = starCellY * this.boardWidth;
        this.starCell2 = this.starCell1 + this.boardWidth - 1;
        for (let row = 0; row < this.boardWidth; row++) {
            html += "<tr>";
            for (let col = 0; col < this.boardHeight; col++) {
                html += `<td class="boardCell" id="cell${cellNum}" onclick="board.cellClicked(event)">`;
                if (cellNum === this.starCell1 || cellNum === this.starCell2) {
                    html += `<img src="assets/boardStar2.png" width="17" height="17">`;
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

        let cellNum = cellY * this.boardWidth + cellX;
        let cellId = "cell" + cellNum;
        let cellElem = document.getElementById(cellId);
        cellElem.style.backgroundColor = "#40f040";
        cellElem.innerHTML = `<div class="boardTileBlue">${letter}</div>`;
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
            cellElem.innerHTML = `<img src="assets/boardStar2.png" width="17" height="17">`;
        }
        cellElem.style.backgroundColor = "#d09000";
    }
}
