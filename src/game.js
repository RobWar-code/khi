const game = {
    playWord(player) {
        // Sort the orthogonal of the letters placed or report error
        let placed = rack.lettersPlaced[player];
        let placedObj = this.sortPlacedTiles(placed);
        if (placedObj.error) return;
        let orthogonal = placedObj.orthogonal;
        console.log(orthogonal);
        console.log(placed);
    },

    sortPlacedTiles(placed) {
        let errorObj = {error: true};
        let orthogonal = "";
        if (placed.length > 1) {
            // Determine whether vertical or horizontal
            if (placed[0].cellX === placed[1].cellX) {
                orthogonal = "vertical";
                // Check that all tiles are on the same orthogonal
                if (placed.length > 2) {
                    for (let item of placed) {
                        if (item.cellX != placed[0].cellX) {
                            this.statusReport("Letters must be on the same row or column");
                            return errorObj;
                        }
                    }
                }
                placed.sort((a,b) => a.cellY - b.cellY);
            }
            else if (placed[0].cellY === placed[1].cellY) {
                orthogonal = "horizontal";
                // Check that all tiles are on the same orthogonal
                if (placed.length > 2) {
                    for (let item of placed) {
                        if (item.cellY != placed[0].cellY) {
                            this.statusReport("Letters must be on the same row or column");
                            return errorObj;
                        }
                    }
                }
                placed.sort((a,b) => a.cellX - b.cellX);
            }
            else {
                this.statusReport("Letters must be on the same row or column");
                return errorObj;
            }
        }
        return {error: false, orthogonal: orthogonal};
    },

    statusReport (message) {
        let statusDiv = document.getElementById("statusDiv");
        statusDiv.style.display = "block";
        statusDiv.innerText = message;
        setTimeout(() => {
            statusDiv.style.display = "none";
        }, 8000);
    }

}