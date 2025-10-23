const boardTest = {
    gameTurn: 3,
    boardTestData: [
        [
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "A0|P0|P0|L0|E0|  |  |  |  |  |  |  |  |  |W1|O1|M1|A1|N1|",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |",
            "  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |"
        ]
    ],

    init() {
        let boardNum = 0;
        let tileSetLength = tileSet.tileHold.length;
        let tileHoldFlags = new Array(tileSetLength).fill(false);

        // Collect and assign the test data
        let starCount = 0;
        let testData = this.boardTestData[boardNum];
        let rowCount = 0;
        for (let row of testData) {
            let cellCount = 0
            for (let p = 0; p < row.length; p += 3) {
                let letter = row[p];
                if (letter != " ") {
                    let playerNum = parseInt(row[p+1]);
                    // Possibly choose star tile
                    let starTile = false;
                    if (starCount < 3 && Math.random() < 0.015) {
                        starTile = true;
                        ++starCount;
                    }
                    // Pass the board data
                    board.boardData[rowCount][cellCount] = {
                        letter: letter,
                        starTile: starTile,
                        playerNum: playerNum,
                        temp: false,
                        lastCompLay: false,
                    };
                    // Flag out the letter from the tile set
                    if (starTile) letter = "*";
                    this.flagTileHold(tileHoldFlags, letter);

                }
                else {
                    board.boardData[rowCount][cellCount] = {
                        letter: "",
                        starTile: false,
                        playerNum: -1,
                        temp: false,
                        lastCompLay: false,
                    };
                }
                ++cellCount;
            }
            ++rowCount;
        }
        // Withdraw the tiles used from tileHold
        this.withdrawHoldTiles(tileHoldFlags);
        // Display the board
        board.displayBoard();
        game.gameTurn = this.gameTurn;
    },

    flagTileHold(tileHoldFlags, letter) {
        let index = 0;
        let found = false;
        for (let tile of tileSet.tileHold) {
            if (tile === letter && !tileHoldFlags[index]) {
                tileHoldFlags[index] = true;
                found = true;
                break;
            }
            ++index;
        }
        if (!found) {
            console.log("flagTileHold: Used too many letter:", letter);
        }
    },

    withdrawHoldTiles(tileHoldFlags) {
        let newSet = [];
        let index = 0;
        for (let tile of tileSet.tileHold) {
            if (!tileHoldFlags[index]) {
                newSet.push(tile);
            }
            ++index;
        }
        tileSet.tileHold = newSet;
    }
    
}