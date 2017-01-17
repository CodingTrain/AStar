// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Part 1: https://youtu.be/aKYlikFAV4k
// Part 2: https://youtu.be/EaZxUCWAjb0
// Part 3: https://youtu.be/jwRT4PCT6RU

// 2 options for drawing the walls
// option 0 = corn maze
// option 1 = castle
// (Both look cool)
var drawingOption = 0;

//Set to true to allow diagonal moves
//This will also switch from Manhattan to Euclidean distance measures
var allowDiagonals = true;

// can the path go between the corners of two
// walls located diagonally next to each other
var canPassThroughCorners = false;

// % of cells that are walls
var percentWalls = (allowDiagonals ? (canPassThroughCorners ? 0.4 : 0.3) : 0.2);

// Function to delete element from the array
function removeFromArray(arr, elt) {
  // Could use indexOf here instead to be more efficient
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

//This function returns a measure of aesthetic preference for
//use when ordering the openSet. It is used to prioritise
//between equal standard heuristic scores. It can therefore
//be anything you like without affecting the ability to find
//a minimum cost path.

function visualDist(a, b) {
  return dist(a.i, a.j, b.i, b.j);
}

// An educated guess of how far it is between two points

function heuristic(a, b) {
  var d;
  if (allowDiagonals) {
    d = dist(a.i, a.j, b.i, b.j);
  } else {
    d = abs(a.i - b.i) + abs(a.j - b.j);
  }
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
      grid[i][j] = new Spot(i, j, grid);
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
  for (var i = 1; i < openSet.length; i++) {
    if (openSet[i].f < openSet[winner].f) {
      winner = i;
    }
    //if we have a tie according to the standard heuristic
    if (openSet[i].f == openSet[winner].f) {
      //Prefer to explore options with longer known paths (closer to goal)
      if (openSet[i].g > openSet[winner].g) {
        winner = i;
      }
      //if we're using Manhattan distances then also break ties
      //of the known distance measure by using the visual heuristic.
      //This ensures that the search concentrates on routes that look
      //more direct. This makes no difference to the actual path distance
      //but improves the look for things like games or more closely
      //approximates the real shortest path if using grid sampled data for
      //planning natural paths.
      if (!allowDiagonals) {
        if (openSet[i].g == openSet[winner].g && openSet[i].vh < openSet[winner].vh) {
          winner = i;
        }
      }
    }
  }
  return openSet[winner];
}

// Find any viable neighbors to search through
function addNeighborsToOpenSet(current) {
  var neighbors = current.getNeighbors();

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
      if (allowDiagonals) {
        neighbor.vh = visualDist(neighbor, end);
      }
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
