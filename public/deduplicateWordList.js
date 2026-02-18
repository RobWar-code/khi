const fs = require('fs');

/** Deduplicate the given word list 
 * arg1 - Source File
 * arg2 - Output List
*/

const fileProcess = {

    deduplicate() {
        const args =  process.argv.slice(2);
        const infile = args[0];
        const outfile = args[1];

        const inStr = fs.readFileSync(infile, 'utf8');
        const wordsIn = inStr.split('\n');
        const wordsOut = [];

        let lastWord = "";
        for (let word of wordsIn) {
            if (word != lastWord) {
                wordsOut.push(word);
            }
            lastWord = word;
        }

        let outStr = wordsOut.join('\n');
        fs.writeFileSync(outfile, outStr, 'utf8');
    }

}

fileProcess.deduplicate();