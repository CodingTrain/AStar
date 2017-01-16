// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

var percentWalls = 0.3;

// An object to describe a spot in the grid
function Spot(i, j) {

  // Location
  this.i = i;
  this.j = j;

  // f, g, and h values for A*
  this.f = 0;
  this.g = 0;
  this.h = 0;

  // Neighbors
  this.neighbors = undefined;

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
      // ellipse(this.i * w + w / 2, this.j * h + h / 2, w / 2, h / 2);
      rect(this.i * w, this.j * h, w, h);
    } else if (col){
      fill(col);
      noStroke();
      rect(this.i * w, this.j * h, w, h);
    }
  }

  this.getNeighbors = function(grid) {
    if (!this.neighbors) {
      this.addNeighbors(grid);
    }
    return this.neighbors;
  }

  // Figure out who my neighbors are
  this.addNeighbors = function(grid) {
    this.neighbors = [];
    var i = this.i;
    var j = this.j;

    // right
    if (i < cols - 1) {
      var n = grid[i + 1][j];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // left
    if (i > 0) {
      var n = grid[i - 1][j];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // bottom
    if (j < rows - 1) {
      var n = grid[i][j + 1];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // top
    if (j > 0) {
      var n = grid[i][j - 1];
      if (!n.wall) {
        this.neighbors.push(n);
      }
    }
    // top-left
    if (i > 0 && j > 0) {
      var top = grid[i][j - 1];
      var left = grid[i - 1][j];
      var n = grid[i - 1][j - 1];
      if (!n.wall && !(top.wall && left.wall)) {
        this.neighbors.push(n);
      }
    }
    // top-right
    if (i < cols - 1 && j > 0) {
      var top = grid[i][j - 1];
      var right = grid[i + 1][j];
      var n = grid[i + 1][j - 1];
      if (!n.wall && !(top.wall && right.wall)) {
        this.neighbors.push(n);
      }
    }
    // bottom-left
    if (i > 0 && j < rows - 1) {
      var bottom = grid[i][j + 1];
      var left = grid[i - 1][j];
      var n = grid[i - 1][j + 1];
      if (!n.wall && !(bottom.wall && left.wall)) {
        this.neighbors.push(n);
      }
    }
    // bottom-right
    if (i < cols - 1 && j < rows - 1) {
      var bottom = grid[i][j + 1];
      var right = grid[i + 1][j];
      var n = grid[i + 1][j + 1];
      if (!n.wall && !(bottom.wall && right.wall)) {
        this.neighbors.push(n);
      }
    }
  }
}
