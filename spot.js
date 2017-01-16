// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// An object to describe a spot in the grid
function Spot(i, j, isWall) {

    // Location
    this.i = i;
    this.j = j;

    // f, g, and h values for A*
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.vh = 0; //visual heuristic for prioritising path options

    // Neighbors
    this.neighbors = [];

    // Where did I come from?
    this.previous = undefined;

    // Am I an wall?
    this.wall = isWall;

    // Display me
    this.show = function(col) {
        if (this.wall) {
            fill(0);
            noStroke();
            ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);

            stroke(0);
            strokeWeight(w / 2);
            // Draw line between this and bottom/right neighbor walls
            for(var i=0; i < this.neighbors.length; i++)
            {
                var neighbor = this.neighbors[i];
                if(neighbor.wall &&
                    ((neighbor.i > this.i && neighbor.j == this.j) ||
                    (neighbor.i == this.i && neighbor.j > this.j)))
                {
                    line(this.i * w + w / 2, this.j * h + h / 2,
                        neighbor.i* w + w / 2, neighbor.j * h + h / 2);
                }
            }
        } else if (col) {
            fill(col);
            strokeWeight(0);
            rect(this.i * w, this.j * h, w, h);
        }
    }

    // Figure out who my neighbors are
    this.addNeighbors = function(grid, allowDiagonals) {
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
