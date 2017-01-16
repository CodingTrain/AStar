// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// An object to describe a spot in the grid
function Spot(i, j, x, y ,width, height, isWall) {
    this.i = i;
    this.j = j;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.vh = 0; //visual heuristic for tie-breaking
    this.neighbors = [];
    this.previous = undefined;
    this.wall = isWall;

    this.show = function(color) {
        noStroke();
        fill(color);
        if (this.wall) {
            fill(0);
            ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2);
        } else {
            rect(this.x, this.y, this.width - 1, this.height - 1);
        }
    }

    this.addNeighbors = function(grid, allowDiagonals) {
        var rows = grid[0].length;
        var cols = grid.length;
        var i = this.i;
        var j = this.j;
        if (i < cols - 1) {
            this.neighbors.push(grid[i + 1][j]);
        }
        if (i > 0) {
            this.neighbors.push(grid[i - 1][j]);
        }
        if (j < rows - 1) {
            this.neighbors.push(grid[i][j + 1]);
        }
        if (j > 0) {
            this.neighbors.push(grid[i][j - 1]);
        }
        if (allowDiagonals) {
            if (i > 0 && j > 0) {
                this.neighbors.push(grid[i - 1][j - 1]);
            }
            if (i < cols - 1 && j > 0) {
                this.neighbors.push(grid[i + 1][j - 1]);
            }
            if (i > 0 && j < rows - 1) {
                this.neighbors.push(grid[i - 1][j + 1]);
            }
            if (i < cols - 1 && j < rows - 1) {
                this.neighbors.push(grid[i + 1][j + 1]);
            }
        }
    }
}
