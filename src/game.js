const game = {

    // Constants
    boardWidth: 19,
    boardHeight: 19,
    rackLength: 7,

    buildBoard() {
        let board = document.getElementById("board");
        let html = "";
        let cellNum = 0;
        for (let row = 0; row < this.boardWidth; row++) {
            html += "<tr>";
            for (let col = 0; col < this.boardHeight; col++) {
                html += `<td class="boardCell" id="cell${cellNum} onClick="game.boardClick(event)">`;
                html += "</td>";
                ++cellNum;
            }
            html += "</tr>";
        }
        board.innerHTML = html;
    }
}