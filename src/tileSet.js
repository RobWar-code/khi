const tileSet = {
    numTiles: 0,
    tiles: [
        {letter: "A", quantity: "6"},
        {letter: "B", quantity: "2"},
        {letter: "C", quantity: "3"},
        {letter: "D", quantity: "4"},
        {letter: "E", quantity: "7"},
        {letter: "F", quantity: "2"},
        {letter: "G", quantity: "3"},
        {letter: "H", quantity: "2"},
        {letter: "I", quantity: "6"},
        {letter: "J", quantity: "1"},
        {letter: "K", quantity: "2"},
        {letter: "L", quantity: "4"},
        {letter: "M", quantity: "2"},
        {letter: "N", quantity: "4"},
        {letter: "O", quantity: "5"},
        {letter: "P", quantity: "2"},
        {letter: "Q", quantity: "1"},
        {letter: "R", quantity: "4"},
        {letter: "S", quantity: "5"},
        {letter: "T", quantity: "4"},
        {letter: "U", quantity: "3"},
        {letter: "V", quantity: "2"},
        {letter: "W", quantity: "2"},
        {letter: "X", quantity: "1"},
        {letter: "Y", quantity: "3"},
        {letter: "Z", quantity: "1"},
        {letter: "*", quantity: "3"}
    ],
    tileHold: [],

    startGame() {
        this.fillTileHold();
        rack.fillRacks();
        rack.displayTiles();
    },

    fillTileHold() {
        this.numTiles = 0;
        let tileHold = [];
        for (let letter of this.tiles) {
            this.numTiles += letter.quantity;
            for (let n = 0; n < letter.quantity; n++) {
                tileHold.push(letter.letter);
            }
        }
        this.shuffleArray(tileHold);
        this.tileHold = tileHold;
    },

    shuffleArray(a) {
        let len = a.length;
        for (let n = 0; n < len; n++) {
            let p1 = n;
            let p2 = Math.floor(Math.random() * len);
            if (p2 === p1) {
                --p2;
                if (p2 < 0) p2 = 2;
            }
            let b = a[p1];
            a[p1] = a[p2];
            a[p2] = b;
        }
    },

    changeTiles(rackString) {
        // Add the rack tiles to the hold
        for (let c of rackString) {
            this.tileHold.push(c);
        }
        // Reshuffle the hold
        this.shuffleArray(this.tileHold);
        // Re-draw the letters
        let newRack = "";
        for (let i = 0; i < rack.rackLength; i++) {
            let c = this.tileHold.pop();
            newRack += c;
        }
        return newRack;
    }

}