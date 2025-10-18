const computer = {
    playerNum: 1,
    placed: [],
    vowelCount: 0,
    alphabet: "abcdefghijklmnopqrstuvwxyz",
    acode: 97,
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

    // Debug Vars
    foundCount: 0,
    unmatchedCount: 0,

    play() {
        this.hiScore = 0;
        let passCount = 0;
        let changeCount = 0;
        let lettersFinished = false;
        let pass = false;
        let gotWord = false;
        while (!gotWord && !pass && changeCount < 3 && !lettersFinished) {
            let statusObj = {changeLetters: false, pass: false};
            if (game.gameTurn === 0) {
                statusObj = this.playFirst();
            }
            else {
                // board.redisplayLastComputerWord();
                // statusObj = this.playTurn();
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
                // Display Word
                board.displayComputerWord()
            }
        }
    },

    playFirst() {
        let ownRack = rack.racks[this.playerNum].toLowerCase();
        // Check the rack letters for vowels
        let vowelCount = this.countVowels(ownRack);
        if (vowelCount === 0) {
            // Check rack for "h"
            let gotH = ownRack.indexOf("h");
            let gotC = false;
            let gotS = false;
            if (gotH) {
                gotC = ownRack.indexOf("c");
                gotS = ownRack.indexOf("s");
            }
            if (!(gotH && (gotC || gotS))) {
                return {lettersFinished: false, pass: false, changeLetters: true}
            }
        }        

        // Do two letter combinations
        this.getFirstWord(ownRack);
    },

    getfirstWord(rackSet) {
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
    }
}