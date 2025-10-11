const wordFuncs = {
    wordList: [],

    async loadWordList() {
        const res = await fetch('public/words.txt').catch(() => fetch('/words.txt'));
        if (!res.ok) throw new Error('Failed to load words.txt');
        const text = await res.text();
        const words = text.split('\n').filter(Boolean);
        this.wordList = new Set(words);
    }

}