KHI - Word Lists

<h1>Word List Files
    The original list comes from the npm sourced wordlist module.

    The file used by the khi program is words.txt. 

    words.txt is to be derived from the edited list wordsEdited2.txt (originally sourced
    from WordGuesser). Words in the wordsEdited2.txt file can be terminated with - or --
    to indicate words to be omitted from the khi list or with * or ** to indicate words
    to be included in WordGuesser (or other applications than khi).

    The utility processWordEdits.js removes the * symbols from words in its source list
    and skips words ending in - or -- to produce the list for khi.
