const wordFuncs = {
    wordList: null,
    twoCharIndex: [],
    threeCharIndex: [],
    fourCharIndex: [],
    aCode: 97,

    async loadWordList() {
        const res = await fetch('public/words.txt').catch(() => fetch('/words.txt'));
        if (!res.ok) throw new Error('Failed to load words.txt');
        const text = await res.text();
        const words = text.split('\n').filter(Boolean);
        const wordSet = new Set(words);
        this.wordList = [...wordSet];

        // Create indexes
        let a ="a";
        this.aCode = a.charCodeAt(0);
        this.makeTwoCharIndex();
        this.makeThreeCharIndex();
        this.makeFourCharIndex();

    },

    makeFirstCharIndex() {
        let charList = "abcdefghijklmnopqrstuvwxyz";
        this.firstCharIndex = [0];
        let char = charList[0];
        let index = 0;
        let charIndex = 1;
        for (let word of this.wordList) {
            let firstChar = word[0];
            if (firstChar === char) {
                this.firstCharIndex.push(index);
                ++charIndex;
                char = charList[charIndex];
            }
            ++index;
        }
    },

    makeTwoCharIndex() {
        // Initialise the index to nulls
        twoCharIndexLen = 26 * 26; 
        for (let i = 0; i < twoCharIndexLen; i++) {
            this.twoCharIndex.push(null);
        }

        let index = 0;
        let lastIndexCode = -1;
        for (let word of this.wordList) {
            let code0 = 26 * (word.charCodeAt(0) - this.aCode);
            let code1 = word.charCodeAt(1) - this.aCode;
            let indexCode = code0 + code1;
            if (indexCode != lastIndexCode) {
                this.twoCharIndex[indexCode] = index;
                lastIndexCode = indexCode;
            }
            ++index;
        }
    },

    makeThreeCharIndex() {
        // Initialise the index to nulls
        threeCharIndexLen = 26 ** 3; 
        for (let i = 0; i < threeCharIndexLen; i++) {
            this.threeCharIndex.push(null);
        }

        let index = 0;
        let lastIndexCode = -1;
        for (let word of this.wordList) {
            let indexCode = this.getIndexCode(word, 3);
            if (indexCode != null) {
                if (indexCode != lastIndexCode) {
                    this.threeCharIndex[indexCode] = index;
                    lastIndexCode = indexCode;
                }
            }
            ++index;
        }
    },

    makeFourCharIndex() {
        // Initialise the index to nulls
        fourCharIndexLen = 26 ** 4; 
        for (let i = 0; i < fourCharIndexLen; i++) {
            this.fourCharIndex.push(null);
        }

        let index = 0;
        let lastIndexCode = -1;
        for (let word of this.wordList) {
            let indexCode = this.getIndexCode(word, 4);
            if (indexCode != null) {
                if (indexCode != lastIndexCode) {
                    this.fourCharIndex[indexCode] = index;
                    lastIndexCode = indexCode;
                }
            }
            ++index;
        }
    },

    getIndexCode(word, keyLen) {
        let indexCode = null;
        if (word.length >= keyLen) {
            let codeFactor = 26 ** (keyLen - 1);
            indexCode = 0;
            for (let i = 0; i < keyLen; i++) {
                let c = word.charCodeAt(i) - this.aCode;
                indexCode += c * codeFactor;
                codeFactor = codeFactor / 26;
            }
        }
        return indexCode;
    },

    validateWords(wordSet) {
        let invalid = [];
        for (let wordItem of wordSet) {
            let word = wordItem.word;
            if (this.indexFindWord(word) === false) {
                invalid.push(word);
            }
        }
        return invalid;
    },

    indexFindWord(word) {
        let found = false;
        let gotStart = false;
        let lookup;
        let keyLen;
        if (word.length <= 2) {
            lookup = this.twoCharIndex;
            keyLen = 2;
        }
        else if (word.length === 3) {
            lookup = this.threeCharIndex;
            keyLen = 3;
        }
        else {
            lookup = this.fourCharIndex;
            keyLen = 4;
        }
        let w = word.toLowerCase();
        let indexCode = this.getIndexCode(w, keyLen);
        let startIndex = lookup[indexCode];
        if (startIndex != null) {
            // Search Word List
            let initial = w.substring(0, 2);
            for (let i = startIndex; i < this.wordList.length; i++) {
                let w1 = this.wordList[i];
                let initial1 = w1.substring(0, 2);
                if (initial != initial1) {
                    break;
                }
                if (w1 > w) {
                    if (w1.length > w.length) {
                        if (w1.substring(0, w.length) === w) {
                            gotStart = true;
                        }
                    }
                    break;
                }
                if (w1 === w) {
                    found = true;
                    break;
                }
            }        
        }
        return {found: found, gotStart: gotStart};
    },

    getWordList(combo, maxLen) {
        let wordSet = [];
        let foundObj = this.searchIndex(combo);
        if (foundObj.found) {
            let offset = foundObj.offset;
            let done = false;
            while (!done && offset < this.wordList.length) {
                let word = this.wordList[offset];
                let ref = word.substring(0, combo.length);
                if (ref != combo) {
                    break;
                }
                if (word.length <= maxLen && word.length > combo.length) {
                    wordSet.push(word);
                }
                ++offset;
            }
        }
        return wordSet;
    },

    searchIndex(combo) {
        let keyLen = combo.length;
        let indexCode = this.getIndexCode(combo, keyLen);
        let offset = -1;
        switch(keyLen) {
            case 2:
                offset = this.twoCharIndex[indexCode];
                break;
            case 3:
                offset = this.threeCharIndex[indexCode];
                break;
            case 4:
                offset = this.fourCharIndex[indexCode];
                break;
            default:
                throw error("searchIndex - invalid key length:", combo);
        } 

        let isWord = false;
        let found = false;
        if (offset != null && offset != -1) {
            // Check whether the combo is a word
            if (this.wordList[offset] === combo) {
                isWord = true;
            } 
            found = true;
        }
        return {found: found, isWord: isWord, offset: offset};
    },

    testSearch() {
        let words = [
            "on",
            "xn",
            "ion",
            "szn",
            "rate",
            "rtyx",
            "ABACUS",
            "donkey",
            "LLAMA",
            "snake",
            "YAGYAG",
            "zoo",
            "zygote"
        ];

        for (let word of words) {
            let found = this.indexFindWord(word);
            console.log("word:", word, "found:", found);
        }
    }

}
