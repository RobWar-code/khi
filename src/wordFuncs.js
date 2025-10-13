const wordFuncs = {
    wordList: null,
    firstCharIndex: [],
    twoCharIndex: [],
    aCode: 97,

    async loadWordList() {
        const res = await fetch('public/words.txt').catch(() => fetch('/words.txt'));
        if (!res.ok) throw new Error('Failed to load words.txt');
        const text = await res.text();
        const words = text.split('\n').filter(Boolean);
        const wordSet = new Set(words);
        this.wordList = [...wordSet];

        // Create first letter index
        let a ="a";
        this.aCode = a.charCodeAt(0);
        this.makeTwoCharIndex();
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
            // Debug
            if (word === "snake") console.log("found snake");
            if (indexCode != lastIndexCode) {
                this.twoCharIndex[indexCode] = index;
                lastIndexCode = indexCode;
            }
            ++index;
        }
    },

    indexFindWord(word) {
        let w = word.toLowerCase();
        let code0 = 26 * (w.charCodeAt(0) - this.aCode);
        let code1 = w.charCodeAt(1) - this.aCode;
        let indexCode = code0 + code1;
        let startIndex = this.twoCharIndex[indexCode];
        // Search Word List
        let found = false;
        let initial = w.substring(0, 2);
        for (let i = startIndex; i < this.wordList.length; i++) {
            let w1 = this.wordList[i];
            let initial1 = w1.substring(0, 2);
            if (initial != initial1) {
                break;
            }
            if (w1 > w) {
                break;
            }
            if (w1 === w) {
                found = true;
                break;
            }
        }        
        return found;
    },

    testSearch() {
        let words = [
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