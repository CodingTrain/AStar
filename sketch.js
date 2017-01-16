// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// Function to delete element from the array
function removeFromArray(arr, elt) {
  // Could use indexOf here instead to be more efficient
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

// An educated guess of how far it is between two points
function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j);
  // var d = abs(a.i - b.i) + abs(a.j - b.j);
  return d;
}

// How many columns and rows?
var cols = 50;
var rows = 50;

// This will the 2D array
var grid = new Array(cols);

// Open and closed set
var openSet = [];
var closedSet = [];

// Start and end
var start;
var end;

// Width and height of each cell of grid
var w, h;

// % of cells that are walls
var percentWalls = 0.3;

// can the path go between the corners of two
// walls located diagonally next to each other
var canPassThroughCorners = false;

// function for drawing a wall
function drawWall(shape) {
  fill(0);
  noStroke();

  // var x = shape.i * w + w / 2;
  // var y = shape.j * h + h / 2;
  // ellipse(x, y, w, h);

  var x = shape.i * w;
  var y = shape.j * h;
  rect(x, y, w, h);
}



// Timer
var t;
var timings = {};

function startTime() {
  t = millis();
}

function recordTime(n) {
  if (!timings[n]) {
    timings[n] = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings[n].sum = timings[n].sum + millis() - t;
    timings[n].count = timings[n].count + 1;
  }
}

function logTimings() {
  for (var prop in timings) {
    if(timings.hasOwnProperty(prop)) {
      console.log(prop + " = " + (timings[prop].sum / timings[prop].count).toString() + " ms");
    }
  }
}

// The road taken
var path = [];

function setup() {
  console.log('A*');

  startTime();

  if (getURL().toLowerCase().indexOf("fullscreen") === -1) {
    createCanvas(400, 400);
  } else {
    var sz = min(windowWidth, windowHeight);
    createCanvas(sz, sz);
  }

  // Grid cell size
  w = width / cols;
  h = height / rows;

  // Making a 2D array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  // Start and end
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  // openSet starts with beginning only
  openSet.push(start);

  recordTime("Setup");
}

function draw() {
  // Am I still searching?
  if (openSet.length > 0) {
    startTime();

    var current = findNextSpot();

    // Did I finish?
    if (current === end) {
      noLoop();
      console.log("DONE!");
      createP('Completed!');
      logTimings();
    }

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // Check all the neighbors
    addNeighborsToOpenSet(current);

    recordTime("Algorithm");
  } else {
    // Uh oh, no solution
    noLoop();
    console.log('no solution');
    createP('No solution.');
    logTimings();
    return;
  }

  drawGrid();

  path = calcPath(current);
  drawPath(path);
}


// Find next spot
function findNextSpot() {
  // Best next option
  var winner = 0;
  for (var i = 0; i < openSet.length; i++) {
    if (openSet[i].f < openSet[winner].f) {
      winner = i;
    }
  }
  return openSet[winner];
}

// Find any viable neighbors to search through
function addNeighborsToOpenSet(current) {
  var neighbors = current.getNeighbors(grid);

  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i];

    // Valid next spot?
    if (!closedSet.includes(neighbor)) {
      var tempG = current.g + heuristic(neighbor, current);

      // Is this a better path than before?
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tempG >= neighbor.g) {
        // No, it's not a better path
        continue;
      }

      neighbor.g = tempG;
      neighbor.h = heuristic(neighbor, end);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.previous = current;
    }
  }
}


// Draw current state of everything
function drawGrid() {
  startTime();

  background(255);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0, 50));
  }
  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0, 50));
  }

  recordTime("Draw Grid");
}

// Find the path by working backwards
function calcPath(current) {
  startTime();

  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  recordTime("Calc Path");

  return path;
}

// Drawing path as continuous line
function drawPath(path) {
  startTime();

  noFill();
  stroke(255, 0, 200);
  strokeWeight(w / 2);

  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();

  recordTime("Draw Path");
}
