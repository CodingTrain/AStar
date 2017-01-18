function SearchMap(cols, rows, x, y, w, h, allowDiagonals, wallRatio ) {
    // How many columns and rows?
    this.cols = cols;
    this.rows = rows;

    // This will the 2D array
    this.grid = [];
    this.path = [];

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Making a 2D array
    for (var i = 0; i < cols; i++) {
        this.grid[i] = [];
    }

    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            var isWall = random(1.0) < wallRatio;
            this.grid[i][j] = new Spot(i, j, x + i * w / cols, y + j * h / rows, w / cols, h / rows, isWall, this.grid);
        }
    }

    //for (var i = 0; i < cols; i++) {
    //    for (var j = 0; j < rows; j++) {
    //        this.grid[i][j].addNeighbors(this.grid, allowDiagonals);
    //    }
    //}
}
