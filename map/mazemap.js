// Maze generation Algorithm

function MazeMap(cols, rows, x, y, w, h, allowDiagonals, percentWalls) {
  this.cols = cols;
  this.rows = rows;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.allowDiagonals = allowDiagonals;

  this.grid = [];
  this.path = [];
  this.start = { x: 0, y: 0 };
  this.end = { x: cols - 1, y: rows - 1 };

  this.grid = [];
  for (var i = 0; i < this.cols; i++) {
      this.grid[i] = [];
      for (var j = 0; j < this.rows; j++) {
          this.grid[i][j] = new Spot(i, j, x + i * w /this.cols, y + j * h / this.rows, w / this.cols, h / this.rows, true, this.grid);
      }
  }
  // collumn and row
  var c = 0;
  var r = 0;
  var history = [[0, 0]];

  // As long as there is at least one location in history
  while (history.length) {
    var left = this.grid[c][r - 2];
    var right = this.grid[c][r + 2];
    var up = this.grid[c - 2] && this.grid[c - 2][r];
    var down = this.grid[c + 2] && this.grid[c + 2][r];
    var current = this.grid[c][r];
    current.visited = true;
    current.wall = false;

    var check = [] // The neighbors that need to be checked
    if (left && !left.visited) {
      check.push(left);
    }

    if (up && !up.visited) {
      check.push(up);
    }

    if (right && !right.visited) {
      check.push(right);
    }

    if (down && !down.visited) {
      check.push(down);
    }

    // If there is a valid neighbor location
    if (check.length) {
      history.push([c, r]);
      // We choose a random location to make a path
      var direction = check[Math.floor(Math.random() * check.length)];
      if (direction == left) {
        left.wall = false;
        this.grid[c][r - 1].wall = false;
        r -= 2;
      }

      else if (direction == up) {
        up.wall = false;
        this.grid[c - 1][r].wall = false;
        c -= 2;
      }

      else if (direction == right) {
        right.wall = false;
        this.grid[c][r + 1].wall = false;
        r += 2;
      }

      else if (direction == down) {
        down.wall = false;
        this.grid[c + 1][r].wall = false;
        c += 2;
      }
    }
    else {
      // We backtrack to the last place in history
      // if there is no valid neighbor
      var next = history.pop();
      c = next[0];
      r = next[1];
    }
  }

  // Makes sure there's a possible exit to the maze
  // Change me if you change the end location!
  this.grid[cols - 1][rows - 2].wall = false;
  this.grid[cols - 2][rows - 1].wall = false;
  this.grid[this.end.x][this.end.y].wall = false;
  this.grid[this.start.x][this.start.y].wall = false;
}
