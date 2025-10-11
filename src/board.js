const board = {
// Constants
    boardWidth: 19,
    boardHeight: 19,

    buildBoard() {
        let boardElem = document.getElementById("board");
        let html = "";
        let cellNum = 0;
        let starCellY = Math.floor(this.boardHeight/2);
        let starCell1 = starCellY * this.boardWidth;
        let starCell2 = starCell1 + this.boardWidth - 1;
        for (let row = 0; row < this.boardWidth; row++) {
            html += "<tr>";
            for (let col = 0; col < this.boardHeight; col++) {
                html += `<td class="boardCell" id="cell${cellNum} onClick="game.boardClick(event)">`;
                if (cellNum === starCell1 || cellNum === starCell2) {
                    html += `<img src="assets/boardStar2.png" width="17" height="17">`;
                }
                html += "</td>";
                ++cellNum;
            }
            html += "</tr>";
        }
        boardElem.innerHTML = html;
    }
}
