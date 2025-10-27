const computer = {
    playerNum: 1,
    placed: [],
    vowelCount: 0,
    alphabet: "abcdefghijklmnopqrstuvwxyz",
    aCode: 97,
    letterScores: [
        {letter: "a", score: 1},
        {letter: "b", score: 2},
        {letter: "c", score: 2},
        {letter: "d", score: 1},
        {letter: "e", score: 1},
        {letter: "f", score: 2},
        {letter: "g", score: 2},
        {letter: "h", score: 2},
        {letter: "i", score: 1},
        {letter: "j", score: 3},
        {letter: "k", score: 3},
        {letter: "l", score: 1},
        {letter: "m", score: 2},
        {letter: "n", score: 1},
        {letter: "o", score: 1},
        {letter: "p", score: 2},
        {letter: "q", score: 3},
        {letter: "r", score: 1},
        {letter: "s", score: 1},
        {letter: "t", score: 1},
        {letter: "u", score: 2},
        {letter: "v", score: 2},
        {letter: "w", score: 2},
        {letter: "x", score: 3},
        {letter: "y", score: 2},
        {letter: "z", score: 3},
        {letter: "*", score: 0.5}
    ],
    hiScore: 0,
    hiCheckSet: [],
    hiCombo: "",
    hiCellX: 0,
    hiCellY: 0,
    hiCellOrthogonal: "", 
    hiNewWords: [],
    hiCrossWords: [],

    /* 
    checkSet Object
    {
        letter: "",
        star: false,
        currentSelection: null, //or level/layer (if layer = -(layer + 1))
        selectionFlag/selectionNum: -1, // or level
        cellX: n, // Position on board
        cellY: n,
        rackPos: n, // The position in the rack of the character
    }
    */

    // Debug Vars
    foundCount: 0,
    unmatchedCount: 0,

    play() {
        this.hiScore = 0;
        let changeCount = 0;
        let lettersFinished = false;
        let gameComplete = false;
        let pass = false;
        let gotWord = false;
        while (!gotWord && !pass && changeCount < 3 && !lettersFinished) {
            let statusObj = {lettersFinished: false, changeLetters: false, pass: false, gameComplete: false};
            if (game.gameTurn === 0) {
                statusObj = this.playFirst();
            }
            else {
                // board.redisplayLastComputerWord();
                statusObj = this.playTurn();
            }

            if (statusObj.lettersFinished) {
                lettersFinished = true;
            }
            else if (statusObj.changeLetters) {
                if (changeCount < 3) {
                    rack.changeTiles(this.playerNum);
                }
                ++changeCount;
            }
            else if (statusObj.pass) {
                pass = true;
            }
            else if (this.hiScore > 0) {
                gotWord = true;
                if (game.gameTurn === 0) {
                    this.firstWordSetLettersPlaced();
                }
                // Display Word
                this.setComputerWord();
                lettersFinished = this.replenishRack();
            }
        }
        if (gameComplete) {
            // Do game complete actions
        }
        if (lettersFinished) {
            // Do end of game, all letters used
        }
        // Possibly return end of game conditions
    },

    playFirst() {
        let rackTemp = rack.racks[this.playerNum];
        // Create the string of rack letters
        let ownRack = "";
        for (let c of rackTemp) {
            if (c != "") {
                ownRack += c.toLowerCase();
            }
        }

        console.log("rack:", ownRack);
        // Check the rack letters for vowels
        let vowelCount = this.countVowels(ownRack);
        if (vowelCount === 0) {
            // Check rack for "h" - "sh" and "ch"
            let gotH = ownRack.indexOf("h");
            let gotC = false;
            let gotS = false;
            if (gotH) {
                gotC = ownRack.indexOf("c");
                gotS = ownRack.indexOf("s");
            }
            if (!(gotH && (gotC || gotS))) {
                return {lettersFinished: false, pass: false, changeLetters: true, gameComplete: false};
            }
        }        

        // Do two letter combinations
        this.getFirstWord(ownRack);
        return {lettersFinished: false, pass: false, changeLetters: false, gameComplete: false};
    },

    getFirstWord(rackSet) {
        let checkSet = [];
        let good = false;
        // Compose the checkSet
        for (let c of rackSet) {
            let item = {
                letter: c,
                star: c === "*" ? true : false,
                selectionNum: -1,
                currentSelection: -1
            }
            checkSet.push(item);
        }

        let charPtr = [0,0,0,0];
        let firstChars = "";
        let firstCharsDone = false;
        let firstCharPtr = 0;
        while (!firstCharsDone) {
            let combo = "";
            let gotStar = false;
            // Clear the selection nums
            for (let item of checkSet) {
                item.selectionNum = -1;
            }

            // Select the first letter
            let letter0 = checkSet[firstCharPtr].letter;
            if (checkSet[firstCharPtr].star) letter0 = "*";
            firstChars += letter0;
            if (letter0 === "*") {
                checkSet[firstCharPtr].star = true;
                gotStar = true;
            }
            checkSet[firstCharPtr].selectionNum = 0;
            checkSet[firstCharPtr].currentSelection = 0;
            
            // Loop on star selections
            let starDone = false;
            let starCount = 0;
            while (!starDone && starCount < this.alphabet.length) {
                if (gotStar) {
                    checkSet[firstCharPtr].letter = this.alphabet[starCount];
                    ++starCount;
                }
                else {
                    starDone = true;
                }
                combo = checkSet[firstCharPtr].letter;
                // Search level 1 and downward
                this.searchLevel(1, checkSet, charPtr, combo, gotStar);

            } // End first char star loop

            // Next First Char
            // Loop through next chars until found or end
            let ptrObj = this.updateFirstCharPtr(firstCharPtr, checkSet, firstChars);
            if (!ptrObj.found) {
                firstCharsDone = true;
            }
            else {
                firstCharPtr = ptrObj.firstCharPtr;
            }
 
        } // End First Char Loop
        good = true;
        return good;
    },

    playTurn() {
        // Get number of levels
        // Debug
        rack.racks[this.playerNum] = ["A", "W", "Z", "B", "N", "L", "R"];
        console.log("playTurn - rack:", rack.racks[this.playerNum]);
        let numLevels = 0;
        for (let c of rack.racks[this.playerNum]) {
            if (c != "") {
                ++numLevels;
            }
        }
        let levelData = new Array(numLevels).fill(null);
        let gotWin = false;
        let positionCount = 0;
        let positionCellX = 0;
        let positionCellY = -1;
        let endOfPositions = false;
        while (positionCount < 8 && !endOfPositions && !gotWin) {
            // Get the next position
            let positionObj = board.findNextOwnCell(this.playerNum, positionCellX, positionCellY);
            console.log("positionObj:",positionObj);
            if (positionObj.ownTileFound) {
                positionCellX = positionObj.cellX;
                positionCellY = positionObj.cellY;
                let orthogonal;
                // For each vacant cell adjacent to own tile
                for (let adjCell of positionObj.validCells) {
                    orthogonal = "horizontal";
                    if (adjCell.cellY != positionCellY) orthogonal = "vertical";

                    console.log("playTurn: before add letters - adjcell", adjCell);
                    let wordsObj = this.addLetters(levelData, positionCellX, positionCellY, 
                        adjCell.cellX, adjCell.cellY, orthogonal);
                    console.log("playTurn: after addLetters to end, did adjCell:", adjCell, wordsObj);
                    let gotWin = wordsObj.gotWin;

                    if (!gotWin) {
                        console.log("playTurn: before doStartLetters - adjCell:", adjCell);
                        gotWin = this.doStartLetters(adjCell.cellX, adjCell.cellY, orthogonal);
                        console.log("playTurn: after doStartLetters");
                    }
                    if (gotWin) break;
                }
                // Debug
                console.log("playTurn - completed adjCells", this.hiScore, this.hiCombo, rack.racks[this.playerNum]);
                throw "Debug Exit";
                ++positionCount;
            }
            else {
                endOfPositions = true;
            }
        }
    },

    addLetters(levelData, ownCellX, ownCellY, adjCellX, adjCellY, orthogonal) {
        let endObj = {gotWin: false};
        // Get scan word data
        let scanObj = board.scanWord(ownCellX, ownCellY, orthogonal);
        // Check that scan word does not end at edge of board
        if (((orthogonal === "vertical" && scanObj.endY < board.boardHeight - 1) || 
            (orthogonal === "horizontal" && scanObj.endX < board.boardWidth - 1)) ||
            (adjCellX < ownCellX || adjCellY < ownCellY)) {
            // Set the level data for downward or rightward search
            // do the first checkSet
            let checkSet = this.makeCheckSet();
            levelData[0] = {
                checkSetPtr: -1,
                checkSet: checkSet,
                charsUsed: "",
                letter: "",
                scanWord: scanObj.word,
                scanData: {
                    startX: scanObj.startX,
                    startY: scanObj.startY,
                    endX: scanObj.endX,
                    endY: scanObj.endY
                },
                cellX: adjCellX,
                cellY: adjCellY
            }
            let level = 0;
            endObj = this.addEndLetters(levelData, level, orthogonal);
            // Check for got win
            // Prepare to do start chars
            // Do right angle
        }
        else {
            // Do the upward or leftward search
        }
        return endObj;
    },

    makeCheckSet() {
        let checkSet = [];
        // Add letters from rack, excluding stars
        let index = 0;
        for (let item of rack.racks[this.playerNum]) {
            if (item != "*" && item != "") {
                checkSet.push({
                    letter: item,
                    star: false,
                    currentSelection: null,
                    selectionFlag: -1,
                    cellX: -1,
                    cellY: -1,
                    rackPos: index
                });
            }
            ++index;
        }
        // Add in the stars
        index = 0;
        for (let item of rack.racks[this.playerNum]) {
            if (item === "*") {
                checkSet.push({
                    letter: item,
                    star: true,
                    currentSelection: null,
                    selectionFlag: -1,
                    cellX: -1,
                    cellY: -1,
                    rackPos: index
                });
            };
            ++index;
        }
        return checkSet;
    },

    addEndLetters(levelData, level, orthogonal) {
        /*
            levelData [ // upto rack.rackLength entries
                {
                    checkSet: {letter, star, currentSelection, selectionFlag},
                    charsUsed: "",
                    checkSetPtr: n,
                    scanWord: ,
                    scanWordData: ,
                    letter: ,
                    cellX: ,
                    cellY: 
                }
            ]
        */
        let gotWin = false;
        if (level >= levelData.length) return gotWin;

        let checkSet = levelData[level].checkSet;
        let checkSetPtr = levelData[level].checkSetPtr;
        let charsUsed = levelData[level].charsUsed;
        while (!gotWin && checkSetPtr < checkSet.length) {
            // get next letter from checkSet
            let charFound = false;
            let letter = "";
            if (checkSetPtr > -1) checkSet[checkSetPtr].currentSelection = null;
            while (!charFound && checkSetPtr < checkSet.length) {
                ++checkSetPtr;
                if (checkSetPtr < checkSet.length) {
                    if (checkSet[checkSetPtr].currentSelection === null) {
                        letter = checkSet[checkSetPtr].letter;
                        if (checkSet[checkSetPtr].star) letter = "*";
                        // Check whether the letter has been used before
                        if (charsUsed.indexOf(letter) < 0) {
                            charFound = true;
                            charsUsed += letter;
                        }
                    }
                } 
            }
            levelData[level].checkSetPtr = checkSetPtr;
            if (charFound) {
                // Record the board position of the check set letter
                checkSet[checkSetPtr].cellX = levelData[level].cellX;
                checkSet[checkSetPtr].cellY = levelData[level].cellY;
                // Flag the letter
                checkSet[checkSetPtr].currentSelection = level;
                console.log("addEndLetters: letter, checkSet", letter, checkSetPtr, checkSet);
                let starCount = 0;
                let starMax = this.alphabet.length - 1;
                if (letter != "*") starMax = 0;
                while (starCount <= starMax && !gotWin) {
                    if (starMax > 0) {
                        letter = this.alphabet[starCount];
                    }
                    levelData[level].letter = letter;
                    let endLetterObj = this.addEndLetter(levelData, level, orthogonal);
                    let found = endLetterObj.found;
                    gotWin = endLetterObj.gotWin;
                    if (found && !gotWin) {
                        // Set the new level data
                        levelData[level].letter = letter,
                        levelData[level].charsUsed = charsUsed,
                        levelData[level].scanWord = endLetterObj.scanWord,
                        levelData[level].scanData = endLetterObj.scanData
                        const {endOfLevels, beyondEdge} = this.getNextLevelCheckSet(levelData, level, orthogonal);
                        if (!endOfLevels && !beyondEdge) {
                            let endObj = this.addEndLetters(levelData, level + 1, orthogonal);
                            gotWin = endObj.gotWin;
                        }
                        else {
                            // get the next letter
                        }
                    }
                    else {
                        // get the next letter
                    }
                    ++starCount;
                } // End while star/letter
            } // End if got checkset char
        } // End while !gotWin and got checkset char
        // Remove the last checkset letter placed from the board
        // Debug
        let cellX = levelData[level].cellX;
        let cellY = levelData[level].cellY;
        board.boardData[cellY][cellX] = {
            letter: "",
            playerNum: -1,
            starTile: false,
            temp: false,
            lastCompLay: false
        }
        return {gotWin: gotWin};
    },

    addEndLetter(levelData, level, orthogonal) {
        let letter = levelData[level].letter;
        // add the test letter to the board
        let cellX = levelData[level].cellX;
        let cellY = levelData[level].cellY;
        board.boardData[cellY][cellX] = {
            letter: letter,
            playerNum: this.playerNum,
            starTile: false,
            temp: false,
            lastCompLay: false
        }

        // Check the right-angle word
        let rightAngle = "horizontal";
        if (orthogonal === "horizontal") {
            rightAngle = "vertical";
        }
        let scanObj = board.scanWord(cellX, cellY, rightAngle);
        let found = false;
        if (scanObj.word.length > 1) {
            let foundObj = wordFuncs.indexFindWord(scanObj.word);
            found = foundObj.found;
            // if the right-angle word does not exist
            if (!found) {
                return {gotWord: false, found: false, gotWin: false}
            }
        }

        // get the new scan word and scan data
        scanObj = board.scanWord(cellX, cellY, orthogonal);
        found = false;
        let gotWord = false;
        let newScanWord = scanObj.word;
        let newScanData = {startX: scanObj.startX, endX: scanObj.endX, startY: scanObj.startY, endY: scanObj.endY,
            blueCount: scanObj.blueCount, blackCount: scanObj.blackCount
        };

        // Scan the word list
        let gotWin = false;
        foundObj = wordFuncs.indexFindWord(newScanWord);
        gotWord = foundObj.found;
        found = foundObj.gotStart || gotWord;
        // if no match is found
        if (!found) {
            return {gotWord: false, found: false, gotWin: false};
        }
        // if a word is found
        if (gotWord) {
            // score it, and if it is the highest, save it
            console.log("addEndLetter - level checkSet", levelData[level].checkSet);
            gotWin = this.scoreScanWord(false, levelData, level, newScanWord, newScanData, orthogonal);
        }
        return {gotWin: gotWin, gotWord: gotWord, found: found, 
            scanWord: newScanWord, scanData: newScanData}              
    },


    getNextLevelCheckSet(levelData, level, orthogonal) {
        let newLevel = level + 1;
        if (newLevel >= levelData.length) {
            return {endOfLevels: true, beyondEdge: false};
        }
        // Get the new position from the scanWord data
        let endX = levelData[level].scanData.endX;
        let endY = levelData[level].scanData.endY;
        if (orthogonal === "vertical") {
            ++endY;
        }
        else {
            ++endX;
        }
        if (endX >= board.boardWidth || endY >= board.boardHeight) {
            return {endOfLevels: false, beyondEdge: true}
        }
        // Copy the checkSet from the old level
        let checkSet = JSON.parse(JSON.stringify(levelData[level].checkSet));
        // Clear selection Flags
        for (let item of checkSet) {
            item.selectionFlag = -1;
        }
        levelData[newLevel] = {};
        levelData[newLevel].checkSet = checkSet;
        levelData[newLevel].checkSetPtr = 0;
        levelData[newLevel].cellX = endX;
        levelData[newLevel].cellY = endY;
        levelData[newLevel].letter = "";
        levelData[newLevel].charsUsed = "";
        return {endOfLevels: false, beyondEdge: false};
    },

    doStartLetters(cellX, cellY, orthogonal) {
        // Count the number of letters in the rack
        let count = 0;
        for (let item of rack.racks[this.playerNum]) {
            if (item != "") {
                ++count;
            }
        }
        // Set-up the layerData and checkSet for the first letter
        let layerData = new Array(count);
        let layer = 0;
        let checkSet = this.makeCheckSet();
        let checkSetPtr = -1;
        let charsUsed = "";
        let gotWin = false;
        layerData[0] = {
            checkSet: checkSet,
            checkSetPtr: checkSetPtr,
            charsUsed: "",
            cellX: cellX,
            cellY: cellY
        };

        // while not end of first letter selection
        let endOfCheckSet = false;
        let pastBoardEdge = false;
        while (!endOfCheckSet && !pastBoardEdge && !gotWin) {
            // Get the checkSet letter
            let letter = "";
            if (checkSetPtr >= 0) checkSet[checkSetPtr].currentSelection = null;
            while (checkSetPtr < checkSet.length) {
                ++checkSetPtr;
                if (checkSetPtr >= checkSet.length) {
                    endOfCheckSet = true;
                    break;
                }
                if (checkSet[checkSetPtr].currentSelection === null) {
                    letter = checkSet[checkSetPtr].letter;
                    if (checkSet[checkSetPtr].star) letter = "*";
                    if (charsUsed.indexOf(letter) < 0) {
                        break;
                    }
                }
            }
            if (!endOfCheckSet) {
                charsUsed += letter;
                checkSet[checkSetPtr].cellX = cellX;
                checkSet[checkSetPtr].cellY = cellY;
                // Add the first letter to the board
                let starMax = 0;
                if (letter === "*") starMax = this.alphabet.length - 1;
                charsUsed += letter;
                for (starCount = 0; starCount <= starMax; starCount++) {
                    if (starMax > 0) {
                        letter = this.alphabet[starCount];
                        checkSet[checkSetPtr].letter = letter;
                    }
                    board.boardData[cellY][cellX] = {
                        letter: letter,
                        starTile: false,
                        playerNum: this.playerNum,
                        temp: false,
                        lastCompLay: false                   
                    }
                    // scan the word
                    let scanObj = board.scanWord(cellX, cellY, orthogonal);
                    let scanWord = scanObj.word;
                    let scanData = {startX: scanObj.startX, endX: scanObj.endX, startY: scanObj.startY, endY: scanObj.endY,
                        blueCount: scanObj.blueCount, blackCount: scanObj.blackCount}
                    // get the next cellX, cellY positions from the scanData
                    let newCellX = scanData.startX;
                    let newCellY = scanData.startY;
                    if (orthogonal === "horizontal") {
                        --newCellX;
                    }
                    else {
                        --newCellY;
                    }
                    if (newCellY < 0 || newCellX < 0) {
                        pastBoardEdge = true;
                        break;
                    }

                    // Check whether the first letter placement makes a valid letter combination
                    let combo = "";
                    if (scanWord.length >= 4) {
                        combo = scanWord.substring(0, 4);
                    }
                    else if (scanWord.length === 3) {
                        combo = scanWord.substring(0, 3);
                    }
                    else {
                        combo = scanWord.substring(0, 2);
                    }
                    let comboFound = wordFuncs.checkCombo(combo);
                    // if a valid combination
                    if (comboFound) {
                        checkSet[checkSetPtr].currentSelection = -(layer + 1); 
                        let newLayer = layer + 1;
                        // set the new layer data and checkSet
                        layerData[newLayer] = {
                            checkSetPtr: -1,
                            checkSet: JSON.parse(JSON.stringify(checkSet)),
                            charsUsed: "",
                            cellX: newCellX,
                            cellY: newCellY,
                            scanWord: scanWord,                
                            scanData: scanData
                        }
                        let gotWin = this.addStartLetters(layerData, layer + 1, orthogonal);
                        if (gotWin) {
                            break;
                        }
                    }
                    else {
                        // Get the next star alpha character
                    }
                } // End Star Loop
                // Get the next checkset char
            } // If not end of checkSet
        } // End Checkset Loop
        // Clear the letter from the board
        board.boardData[cellY][cellX] = {
            letter: "",
            starTile: false,
            playerNum: -1,
            temp: false,
            lastCompLay: false
        }
        return gotWin;
    },

    addStartLetters(layerData, layer, orthogonal) {
        // Get checkSet data
        let checkSet = layerData[layer].checkSet;
        let checkSetPtr = layerData[layer].checkSetPtr;
        let cellX = layerData[layer].cellX;
        let cellY = layerData[layer].cellY;

        let gotWin = false;
        let endOfCheckSet = false;
        let boardEdge = false;
        let charsUsed = "";
        while (!endOfCheckSet && !gotWin && !boardEdge) {
            // Get checkSet pointer
            let letter = "";
            if (checkSetPtr >= 0) checkSet[checkSetPtr].currentSelection = null;
            while (!endOfCheckSet) {
                ++checkSetPtr;
                if (checkSetPtr >= checkSet.length) {
                    endOfCheckSet = true;
                }
                else {
                    if (checkSet[checkSetPtr].currentSelection === null) {
                        letter = checkSet[checkSetPtr].letter;
                        if (checkSet[checkSetPtr].star) letter = "*";
                        if (charsUsed.indexOf(letter) < 0) {
                            break;
                        }
                    }
                }
            }
            if (!endOfCheckSet) {
                checkSet[checkSetPtr].cellX = cellX;
                checkSet[checkSetPtr].cellY = cellY;
                checkSet[checkSetPtr].currentSelection = -(layer + 1);
                // get the checkSet letter
                let starMax = 0;
                if (letter === "*") starMax = this.alphabet.length;
                charsUsed += letter;
                // loop on star and not gotWin
                let starCount = 0;
                while (starCount <= starMax && !gotWin) {
                    if (starMax > 0) {
                        letter = this.alphabet[starCount]; 
                        checkSet[checkSetPtr].letter = letter;
                    }
                    layerData[layer].letter = letter;

                    let foundObj = this.addStartLetter(layerData, layer, orthogonal);
                    gotWin = foundObj.gotWin;
                    if (!gotWin && foundObj.comboFound) {
                        // Add the next character at the start
                        // Create the layer object
                        let newLayer = layer + 1;
                        if (newLayer < checkSet.length) {
                            //
                            let scanData = layerData[layer].scanData;
                            let newCellX = scanData.startX;
                            let newCellY = scanData.startY;
                            if (orthogonal === "horizontal") {
                                --newCellX;
                            }
                            else {
                                --newCellY;
                            }
                            if (newCellX >= 0 && newCellY >= 0) {
                                layerData[newLayer] = {
                                    checkSetPtr: -1,
                                    checkSet: JSON.parse(JSON.stringify(checkSet)),
                                    cellX: newCellX,
                                    cellY: newCellY,
                                    charsUsed: ""
                                }
                                gotWin = this.addStartLetters(layerData, layer, orthogonal);
                            }
                            else {
                                boardEdge = true;
                            }
                        } // If layer greater than check set length
                        else {
                            // Skip the next additional letter
                        }
                    } // If not combo found or gotwin
                    else {
                        // next letter
                    }
                    ++starCount;
                } // Next Star Letter
            } // If Not End of checkSet
        } // While not end of checkset and not gotwin
        // Clear the cell
        board.boardData[cellY][cellX] = {
            letter: "",
            starTile: false,
            playerNum: -1,
            temp: false,
            lastCompLay: false
        }
        return gotWin;
    },

    addStartLetter(layerData, layer, orthogonal) {
        let gotWin = false;
        let comboFound = false;
        let checkSet = layerData[layer].checkSet;
        // Get the letter and insert it
        let letter = layerData[layer].letter;
        let cellX = layerData[layer].cellX;
        let cellY = layerData[layer].cellY;

        board.boardData[cellY][cellX] = {
            letter: letter,
            starTile: false,
            playerNum: this.playerNum,
            temp: false,
            lastCompLay: false
        }

        // check the rightangle scan word
        let rightAngle = "horizontal";
        if (orthogonal === "horizontal") {
            rightAngle = "vertical";
        } 
        let scanObj = board.scanWord(cellX, cellY, rightAngle);
        let scanWord = scanObj.word;
        if (scanWord.length > 1) {
            let foundObj = wordFuncs.indexFindWord(scanWord);
            // if it does not exist
            if (!foundObj.found) {
                return {gotWin: gotWin, comboFound: comboFound};
            }
        }
        
        // get the orthogonal scan word
        scanObj = board.scanWord(cellX, cellY, orthogonal);
        scanWord = scanObj.word;
        let scanData = {startX: scanObj.startX, endX: scanObj.endX, startY: scanObj.startY, endY: scanObj.endY,
            blueCount: scanObj.blueCount, blackCount: scanObj.blackCount}
        layerData[layer].scanWord = scanWord;
        layerData[layer].scanData = scanData;
        let foundObj = wordFuncs.indexFindWord(scanWord);
        let found = foundObj.gotStart;
        let gotWord = foundObj.found;
        // if it exists in the index or is found
        if (found || gotWord) {
            if (gotWord) {
                gotWin = this.scoreScanWord(true, layerData, layer, scanWord, scanData, orthogonal);
            }
            if (!gotWin && layer < checkSet.length - 1) {
                // set-up the level data for the addEndLetters function
                newCellX = scanData.endX;
                newCellY = scanData.endY;
                if (orthogonal === "horizontal") {
                    ++newCellY;
                }
                else {
                    ++newCellX;
                }
                if (newCellX < board.boardWidth && newCellY < board.boardHeight) {
                    let levelData = new Array(checkSet.length - (layer + 1));
                    levelData[0] = {
                        checkSetPtr: -1,
                        checkSet: JSON.parse(JSON.stringify(checkSet)),
                        cellX: newCellX,
                        cellY: newCellY,
                        letter: "",
                        charsUsed: ""
                    }
                    let level = 0;
                    // do the addEndLetters operation
                    gotWin = this.addEndLetters(levelData, level, orthogonal)
                }
            }
        }
        
        // Check whether the combination exists
        if (scanWord.length >= 2) {
            let combo = "";
            if (scanWord.length === 2) {
                combo = scanWord.substring(0, 2);
            }
            else if (scanWord.length === 3) {
                combo = scanWord.substring(0, 3);
            }
            else {
                combo = scanWord.substring(0, 4);
            }
            comboFound = wordFuncs.checkCombo(combo);
        }
        return {gotWin: gotWin, comboFound: comboFound}
    },

    scoreScanWord(isLayer, levelData, level, word, scanData, orthogonal) {
        let newWords = [];
        let crossWords = [];
        let totalScore = 0;
        let gotWin = false;

        // get the letter score from checkSet
        let checkSet = levelData[level].checkSet;
        let checkSetPtr = levelData[level].checkSetPtr;
        let cellX = levelData[level].cellX;
        let cellY = levelData[level].cellY;
        let score = 0;
        let count = 0;
        for (let item of checkSet) {
            let letter = "";
            if (count === checkSetPtr || item.currentSelection != null) {
                letter = item.letter.toLowerCase();
                if (item.star) {
                    letter = "*";
                    score += this.letterScores[this.letterScores.length - 1].score;
                }
                else {
                    let code = letter.charCodeAt(0);
                    code -= wordFuncs.aCode;
                    score += this.letterScores[code].score;
                }
            }
            ++count;
        }
        totalScore += score;

        console.log("scoreScanWord: isLayer, word, letter score, checkSet:", isLayer, word, score, checkSet);

        // get the scores for new words and crossed words
        let x = scanData.startX;
        let y = scanData.startY;
        let leftMostPosition = 100;
        // for each cell letter of the scanWord
        while (x <= scanData.endX && y <= scanData.endY) {
            // Get the right angle
            let rightAngle = "horizontal";
            if (orthogonal === "horizontal") rightAngle = "vertical";
            // scan the right-angle word
            let scanObj = board.scanWord(x, y, rightAngle);
            // if > 1 letter
            if (scanObj.word.length > 1) {
                // if the cell letter is black
                if (board.boardData[y][x].playerNum === this.playerNum) {
                    // add the right-angle word to the new words
                    newWords.push({
                        word: scanObj.word,
                        startX: scanObj.startX,
                        endX: scanObj.endX,
                        startY: scanObj.startY,
                        endY: scanObj.endY
                    });
                }
                else {
                    // add the right-angle word to the cross words
                    crossWords.push({
                        word: scanObj.word,
                        startX: scanObj.startX,
                        endX: scanObj.endX,
                        startY: scanObj.startY,
                        endY: scanObj.endY
                    });
                }

                // add the blue cell count for the right-angle word to the score
                totalScore += scanObj.blueCount;
                // save the left-most position of the right-angle word
                if (scanObj.startX < leftMostPosition) leftMostPosition = scanObj.startX;
                // check whether the left-most position is zero
                // if it is set the gotWin flag
                if (leftMostPosition === 0) gotWin = true;
            }
            // Next cell letter
            if (orthogonal === "horizontal") ++x;
            else ++y;
        }

        // add the scanWord blue cell count to the score
        totalScore += scanData.blueCount;

        // save the left-most position of the scan word
        if (scanData.startX < leftMostPosition) leftMostPosition = scanData.startX;
        // if the left-most position is zero set the gotWin flag
        if (leftMostPosition === 0) {
            gotWin = true;
        }

        // add the left-most position score to the score
        totalScore += board.boardWidth - leftMostPosition;

        // if the score is higher than the hiScore,
        if (totalScore > this.hiScore) {
            // record the hi score details
            this.hiScore = totalScore;
            this.hiCheckSet = JSON.parse(JSON.stringify(checkSet));
            this.hiCombo = word;
            this.hiCellOrthogonal = orthogonal;
            this.hiCellX = cellX;
            this.hiCellY = cellY;
            this.hiNewWords = newWords;
            this.hiCrossWords = crossWords;
        }
        return gotWin;
    },

    searchLevel(level, checkSetSrc, charPtr, combo, gotLevel0Star) {
        // Initialise checkSet

        let checkSet = JSON.parse(JSON.stringify(checkSetSrc));
        // Clear the letter selection flags
        for (let item of checkSet) {
            if (item.currentSelection === -1) {
                item.selectionNum = -1;
            }
        }

        // Get the second letter(s)
        let charsUsed = "";
        let charsEnded = false;
        while (!charsEnded) {
            charPtr[level] = this.getCharPtr(level, checkSet, charsUsed, gotLevel0Star);
            if (charPtr[level] >= 0) {
                let gotStar = false;
                let letter1 = checkSet[charPtr[level]].letter;
                if (letter1 === "*" || checkSet[charPtr[level]].star) {
                    gotStar = true;
                    checkSet[charPtr[level]].star = true;
                    letter1 = "*";
                }
                charsUsed += letter1;
                // Loop through any star values to search the two char index
                let starDone = false;
                let starCount = 0;
                while (!starDone) {
                    // Make the two letter combination
                    if (gotStar) {
                        checkSet[charPtr[level]].letter = this.alphabet[starCount]; 
                        ++starCount;
                    }
                    if (!gotStar || starCount >= this.alphabet.length) {
                        starDone = true;
                    }
                    combo = combo.substring(0, level) + checkSet[charPtr[level]].letter;

                    // Check whether the index entry exists
                    let wordObj = wordFuncs.searchIndex(combo);

                    // If the word exists, score it and save it
                    if (wordObj.isWord) {
                        this.getScore(combo, checkSet);
                    }


                    // Debug
                    // Record the hits and misses
                    if (wordObj.found) {
                        ++this.foundCount;
                    }
                    else {
                        ++this.unmatchedCount;
                    }

                    // Search next level
                    if (wordObj.found && level < 3) {
                        this.searchLevel(level + 1, checkSet, charPtr, combo, gotLevel0Star)
                    }

                    if (wordObj.found && level === 3) {
                        this.firstWordMatch(checkSet, combo)
                    }

                } // End second char star loop
            } // End if second chars
            // else - move to next first char
            else {
                charsEnded = true;
                // Clear the second char check flags
                for (let item of checkSet) {
                    if (item.selectionNum === level) {
                        item.selectionNum = -1;
                    }
                }
                charPtr[level] = -1;
            }

        } // End Second Char Loop
    },

    updateFirstCharPtr(firstCharPtr, checkSet, firstChars) {
        let found = false;
        checkSet[firstCharPtr].currentSelection = -1;
        while (firstCharPtr < checkSet.length && !found) { 
            ++firstCharPtr;
            if (firstCharPtr < checkSet.length) {
                // Check whether a matching character has already been selected
                let letter = checkSet[firstCharPtr].letter;
                if (checkSet[firstCharPtr].star) letter = "*";
                if (firstChars.indexOf(letter) < 0) {
                    found = true;
                }
            }
        }
        // If found clear the second char selections
        if (found) {
            for (let item of checkSet) {
                if (item.selectionNum === 1) {
                    item.selectionNum = -1;
                }
            }
        }
        return {found: found, firstCharPtr: firstCharPtr};
    },

    getCharPtr(level, checkSet, charsUsed, gotLevel0Star) {
        let charPtr = -1;
        let index = 0;
        for (let item of checkSet) {
            if (item.currentSelection === level) {
                item.currentSelection = -1;
                item.selectionNum = -1;
            }
            let letter = item.letter;
            if (item.star) letter = "*";
            if (item.selectionNum === -1) {
                if (!(level === 1 && gotLevel0Star && letter === "*") && charsUsed.indexOf(letter) < 0) {
                    charPtr = index;
                    item.currentSelection = level;
                    item.selectionNum = level;
                    break;
                } 
                else {
                    item.selectionNum = level;
                }
            }
            ++index;
        }
        return charPtr;
    },

    firstWordMatch(checkSetSrc, combo) {
        // Fetch the wordlist for the combination
        let maxLen = checkSetSrc.length;
        let wordList = wordFuncs.getWordList(combo, maxLen);
        if (wordList.length > 0) {
            // Get star count
            let starCountStart = 0;
            for (let item of checkSetSrc) {
                if (item.currentSelection === -1 && (item.star || item.letter === "*")) {
                    ++starCountStart;
                }
            }
            for (let word of wordList) {
                let len = word.length - 1;
                // Get the list of letters remaining in the checkSet
                let checkSet = JSON.parse(JSON.stringify(checkSetSrc));
                for (let item of checkSet) {
                    if (item.currentSelection === -1) {
                        item.selectionNum = -1;
                    }
                }
                let starCount = starCountStart;
                // Parse each word for the letters remaining in the word list
                let stub = word.substring(combo.length);
                let count = 0;
                for (let i = 0; i < stub.length; i++) {
                    let c = stub[i];
                    let found = false;
                    for (let item of checkSet) {
                        if (item.selectionNum === -1) {
                            if (item.star) {
                                letter = "*";
                            }
                            else {
                                letter = item.letter;
                            }
                            if (letter === c) {
                                item.currentSelection = len;
                                item.selectionNum = len;
                                found = true;
                                ++count;
                                break;
                            }
                        }
                    }
                    if (!found && starCount > 0) {
                        for (let item of checkSet) {
                            if (item.selectionNum === -1 && (item.star || item.letter === "*")) {
                                item.letter = c;
                                item.selectionNum = len;
                                item.currentSelection = len;
                                --starCount;
                                ++count;
                                break;
                            }
                        }
                    }
                    if (count === stub.length) break;
                }

                if (count === stub.length) {
                    this.getScore(word, checkSet);
                }
            }
        }

    },

    countVowels(s) {
        let vowels = "aeiouy*";
        let count = 0;
        for (let c of s) {
            if (vowels.indexOf(c) >= 0) {
                ++count;
            }
        }
        return count;
    },

    getScore(combo, checkSet) {
        let len = combo.length;
        // Get the rack letters from the checkset
        let score = 0;
        let index = 0;
        for (let item of checkSet) {
            if (item.currentSelection > -1 && item.currentSelection < len) {
                let letter = item.letter;
                if (item.star) letter = "*";
                score += this.getLetterScore(letter);
            }
            ++index;
        }
        if (score > this.hiScore) {
            // Clone the checkset
            this.hiCheckSet = JSON.parse(JSON.stringify(checkSet));
            this.hiScore = score;
            this.hiCombo = combo;
        }
    },

    getLetterScore(letter) {
        let code;
        if (letter === "*") {
            code = this.alphabet.length;
        }
        else {
            code = letter.charCodeAt(0) - this.acode;
        }
        let score = this.letterScores[code].score; 
        return score;
    },

    replenishRack() {
        // Returns whether all tiles used
        return rack.replenish(this.playerNum);
    },

    setComputerWord() {
        board.setComputerWord();
    },

    firstWordSetLettersPlaced() {
        let len = this.hiCombo.length;
        let cellY = board.starCellY1;
        let cellX = board.starCellX1 - len + 1;
        let placed = [];
        for (let i = 0; i < this.hiCombo.length; i++) {
            let c = this.hiCombo[i];
            // Search the checkset
            let found = false;
            let rackCell = 0;
            for (let item of this.hiCheckSet) {
                if (item.currentSelection >= 0) {
                    if (item.letter === c) {
                        found = true;
                        break;
                    }
                }
                ++rackCell;
            }
            if (!found) {
                console.error("Computer letter not found in check set:", this.hiCombo, this.hiCheckSet);
                throw "program exit";
            }
            placed.push({rackCell: rackCell, letter: c, cellX: cellX, cellY: cellY});
            ++cellX;
        }
        rack.lettersPlaced[this.playerNum] = placed;
    }
}