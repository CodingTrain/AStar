// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// An object to describe a spot in the grid
function Spot(i, j, grid) {
  this.grid = grid;

  // Location
  this.i = i;
  this.j = j;

  // f, g, and h values for A*
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.vh = 0; //visual heuristic for prioritising path options

  // Neighbors
  this.neighbors = undefined;
  this.neighboringWalls = undefined;

  // Where did I come from?
  this.previous = undefined;

  // Am I an wall?
  this.wall = false;
  if (random(1) < percentWalls) {
    this.wall = true;
  }

  // Display me
  this.show = function(col) {
    if (this.wall) {
      fill(0);
      noStroke();

      if (drawingOption === 0) {
        var x = this.i * w + w / 2;
        var y = this.j * h + h / 2;
        ellipse(x, y, w / 2, h / 2);
      } else {
        var x = this.i * w;
        var y = this.j * h;
        rect(x, y, w, h);
      }

      stroke(0);
      strokeWeight(w / 2);

      var nWalls = this.getNeighboringWalls();
      for (var i = 0; i < nWalls.length; i++) {
        var nw = nWalls[i];

        // Draw line between this and bottom/right neighbor walls
        if ((nw.i > this.i && nw.j == this.j)
            || (nw.i == this.i && nw.j > this.j)) {
          line(this.i * w + w / 2,
               this.j * h + h / 2,
               nw.i * w + w / 2,
               nw.j * h + h / 2);
        }

        // Draw line between this and bottom-left/bottom-right neighbor walls
        if (!canPassThroughCorners && (nw.j > this.j)
            && (nw.i < this.i || nw.i > this.i)) {
          line(this.i * w + w / 2,
               this.j * h + h / 2,
               nw.i * w + w / 2,
               nw.j * h + h / 2);
        }
      }
    } else if (col) {
      fill(col);
      noStroke();
      rect(this.i * w, this.j * h, w, h);
    }
  }

  this.getNeighbors = function() {
    if (!this.neighbors) {
      this.addNeighbors();
    }
    return this.neighbors;
  }

  // Figure out who my neighbors are
  this.addNeighbors = function() {
    this.neighbors = [];
    var i = this.i;
    var j = this.j;

    // right
    if (i < cols - 1) {
      var n = this.grid[i + 1][j];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // left
    if (i > 0) {
      var n = this.grid[i - 1][j];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // bottom
    if (j < rows - 1) {
      var n = this.grid[i][j + 1];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // top
    if (j > 0) {
      var n = this.grid[i][j - 1];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    if (allowDiagonals) {
      // top-left
      if (i > 0 && j > 0) {
        var n = this.grid[i - 1][j - 1];
        if (!n.wall) {
          if (canPassThroughCorners) {
            this.neighbors.push(n);
          } else {
            var top = this.grid[i][j - 1];
            var left = this.grid[i - 1][j];
            if (!(top.wall && left.wall)) {
              this.neighbors.push(n);
            }
          }
        }
      }
      // top-right
      if (i < cols - 1 && j > 0) {
        var n = this.grid[i + 1][j - 1];
        if (!n.wall) {
          if (canPassThroughCorners) {
            this.neighbors.push(n);
          } else {
            var top = this.grid[i][j - 1];
            var right = this.grid[i + 1][j];
            if (!(top.wall && right.wall)) {
              this.neighbors.push(n);
            }
          }
        }
      }
      // bottom-left
      if (i > 0 && j < rows - 1) {
        var n = this.grid[i - 1][j + 1];
        if (!n.wall) {
          if (canPassThroughCorners) {
            this.neighbors.push(n);
          } else {
            var bottom = this.grid[i][j + 1];
            var left = this.grid[i - 1][j];
            if (!(bottom.wall && left.wall)) {
              this.neighbors.push(n);
            }
          }
        }
      }
      // bottom-right
      if (i < cols - 1 && j < rows - 1) {
        var n = this.grid[i + 1][j + 1];
        if (!n.wall) {
          if (canPassThroughCorners) {
            this.neighbors.push(n);
          } else {
            var bottom = this.grid[i][j + 1];
            var right = this.grid[i + 1][j];
            if (!(bottom.wall && right.wall)) {
              this.neighbors.push(n);
            }
          }
        }
      }
    }
  }

  this.getNeighboringWalls = function(grid) {
    if (this.neighboringWalls) {
      return this.neighboringWalls;
    }

    this.neighboringWalls = [];
    var i = this.i;
    var j = this.j;

    // right
    if (i < cols - 1) {
      var n = this.grid[i + 1][j];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // left
    if (i > 0) {
      var n = this.grid[i - 1][j];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // bottom
    if (j < rows - 1) {
      var n = this.grid[i][j + 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // top
    if (j > 0) {
      var n = this.grid[i][j - 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // top-left
    if (i > 0 && j > 0) {
      var n = this.grid[i - 1][j - 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // top-right
    if (i < cols - 1 && j > 0) {
      var n = this.grid[i + 1][j - 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // bottom-left
    if (i > 0 && j < rows - 1) {
      var n = this.grid[i - 1][j + 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    // bottom-right
    if (i < cols - 1 && j < rows - 1) {
      var n = this.grid[i + 1][j + 1];
      if (n.wall) {
        this.neighboringWalls.push(n);
      }
    }
    return this.neighboringWalls;
  }
}
