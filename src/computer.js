const computer = {
    playerNum: 1,
    placed: [],
    vowelCount: 0,
    alphabet: "abcdefghijklmnopqrstuvwxyz",

    // Debug Vars
    foundCount: 0,
    unmatchedCount: 0,
    matchedWords: [],

    play() {
        if (game.gameTurn === 0) {
            playFirstWord();
            return;
        }
    },

    playFirstWord() {
        let ownRack = rack.racks[playerNum];
        // Check the rack letters for vowels
        let noVowels = true;
        let count = 0;
        this.vowelCount = 0;
        while (noVowels && count < 5) {
            let vowelCount = this.countVowels(ownRack);
            if (vowelCount > 0) {
                noVowels = false;
                this.vowelCount = vowelCount;
                break;
            }
            else {
                rack.changeTiles(playerNum);
                ownRack = rack.racks[playerNum];
            }
            ++count;
        }
        if (noVowels) {
            // End of Game actions - Report
        }

        // Do two letter combinations
        this.firstWordTwoLetter(rack);
    },

    firstWordTwoLetter(rackSet) {
        rackSet = rackSet.toLowerCase();
        let checkSetTwo = [];
        let good = false;
        // Compose the checkSet
        for (let c of rackSet) {
            let item = {
                letter: c,
                star: false,
                selectionNum: -1
            }
            checkSetTwo.push(item);
        }

        let firstChars = "";
        let firstCharsDone = false;
        let firstCharPtr = 0;
        while (!firstCharsDone) {
            let combo = "";
            let gotStar = false;
            // Clear the selection nums
            for (let item of checkSetTwo) {
                item.selectionNum = -1;
            }

            // Select the first letter
            let letter0 = checkSetTwo[firstCharPtr].letter;
            if (checkSetTwo[firstCharPtr].star) letter0 = "*";
            firstChars += letter0;
            if (letter0 === "*") {
                checkSetTwo[firstCharPtr].star = true;
                gotStar = true;
            }
            checkSetTwo[firstCharPtr].selectionNum = 0;
            
            // Loop on star selections
            let starDone = false;
            let starCount = 0;
            while (!starDone && starCount < this.alphabet.length) {
                if (gotStar) {
                    checkSetTwo[firstCharPtr].letter = this.alphabet[starCount];
                    ++starCount;
                }
                else starDone = true;
                combo = checkSetTwo[firstCharPtr].letter;
                // Get the second letter(s)
                let secondChars = "";
                let secondCharsEnded = false;
                while (!secondCharsEnded) {
                    let secondCharPtr = this.getSecondCharPtr(checkSetTwo, secondChars, gotStar);
                    if (secondCharPtr >= 0) {
                        checkSetTwo[secondCharPtr].selectionNum = 1;
                        let gotStarTwo = false;
                        let letter1 = checkSetTwo[secondCharPtr].letter;
                        if (letter1 === "*" || checkSetTwo[secondCharPtr].star) {
                            gotStarTwo = true;
                            checkSetTwo[secondCharPtr].star = true;
                            letter1 = "*";
                        }
                        secondChars += letter1;
                        // Loop through any star values to search the two char index
                        let secondStarDone = false;
                        let secondStarCount = 0;
                        while (!secondStarDone) {
                            // Make the two letter combination
                            if (gotStarTwo) {
                                checkSetTwo[secondCharPtr].letter = this.alphabet[secondStarCount]; 
                                ++secondStarCount;
                            }
                            if (!gotStarTwo || secondStarCount >= this.alphabet.length) {
                                secondStarDone = true;
                            }
                            combo = combo[0] + checkSetTwo[secondCharPtr].letter;
                            console.log("combo:", combo);
                            // Check whether the index entry exists
                            let wordObj = wordFuncs.searchIndex(combo);

                            // Debug
                            // Record the hits and misses
                            if (wordObj.found) {
                                ++this.foundCount;
                                if (wordObj.isWord) {
                                    this.matchedWords.push(combo);
                                }
                            }
                            else {
                                ++this.unmatchedCount;
                            }

                        } // End second char star loop
                    } // End if second chars
                    // else - move to next first char
                    else {
                        secondCharsEnded = true;
                    }
                } // End Second Char Loop
            } // End first char star loop

            // Next First Char
            // Loop through next chars until found or end
            let found = false;
            while (!firstCharsDone && !found) { 
                ++firstCharPtr;
                if (firstCharPtr < checkSetTwo.length) {
                    // Check whether a matching character has already been selected
                    if (firstChars.indexOf(checkSetTwo[firstCharPtr]) < 0) {
                        found = true;
                    }
                }
                else {
                    firstCharsDone = true;
                }
            }
        } // End First Char Loop
        good = true;
        return good;
    },

    getSecondCharPtr(checkSet, secondChars, gotStar) {
        let secondCharPtr = -1;
        let index = 0;
        for (let item of checkSet) {
            let letter = item.letter;
            if (item.star) letter = "*";
            if (item.selectionNum === -1) {
                if (!(gotStar && item.letter === "*") && secondChars.indexOf(item.letter) < 0) {
                    secondCharPtr = index;
                    break;
                } 
            }
            ++index;
        }
        return secondCharPtr;
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
    }
}