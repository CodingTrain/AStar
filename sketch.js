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

// Timer
var t;
var timings = {};

// The road taken
var path = [];

function setup() {
  console.log('A*');

  if (getURL().toLowerCase().indexOf("fullscreen") === -1) {
    createCanvas(400, 400);
  } else {
    var sz = min(windowWidth, windowHeight);
    createCanvas(sz, sz);
  }

  // Grid cell size
  w = width / cols;
  h = height / rows;

  t = millis();

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

  timings.A = {
    sum: millis() - t,
    count: 1
  };

  // openSet starts with beginning only
  openSet.push(start);
}

function draw() {

  // Am I still searching?
  if (openSet.length > 0) {

    t = millis();

    // Best next option
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    var current = openSet[winner];

    // Did I finish?
    if (current === end) {
      noLoop();
      console.log("DONE!");
      createP('Completed!');

      for (var prop in timings) {
        if(timings.hasOwnProperty(prop)) {
          console.log(prop + " = " + (timings[prop].sum / timings[prop].count).toString());
        }
      }
    }

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // Check all the neighbors
    if (!current.neighbors) {
      current.addNeighbors(grid)
    }
    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];

      // Valid next spot?
      if (!closedSet.includes(neighbor)) {
        var tempG = current.g + heuristic(neighbor, current);

        // Is this a better path than before?
        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }

    if (!timings.C) {
      timings.C = {
        sum: millis() - t,
        count: 1
      };
    } else {
      timings.C.sum = timings.C.sum + millis() - t;
      timings.C.count = timings.C.count + 1;
    }

  // Uh oh, no solution
  } else {
    noLoop();
    console.log('no solution');
    createP('No solution.');

    for (var prop in timings) {
      if(timings.hasOwnProperty(prop)) {
        console.log(prop + " = " + (timings[prop].sum / timings[prop].count).toString());
      }
    }

    return;
  }

  // Draw current state of everything
  background(255);

  t = millis();

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }

  if (!timings.D) {
    timings.D = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings.D.sum = timings.D.sum + millis() - t;
    timings.D.count = timings.D.count + 1;
  }
  t = millis();

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0, 50));
  }

  if (!timings.E) {
    timings.E = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings.E.sum = timings.E.sum + millis() - t;
    timings.E.count = timings.E.count + 1;
  }
  t = millis();

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0, 50));
  }

  if (!timings.F) {
    timings.F = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings.F.sum = timings.F.sum + millis() - t;
    timings.F.count = timings.F.count + 1;
  }
  t = millis();

  // Find the path by working backwards
  path = [];
  var temp = current;
  path.push(temp);
  while (temp.previous) {
    path.push(temp.previous);
    temp = temp.previous;
  }

  if (!timings.G) {
    timings.G = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings.G.sum = timings.G.sum + millis() - t;
    timings.G.count = timings.G.count + 1;
  }
  t = millis();

  // for (var i = 0; i < path.length; i++) {
    // path[i].show(color(0, 0, 255));
  //}

  // Drawing path as continuous line
  noFill();
  stroke(255, 0, 200);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();

  if (!timings.H) {
    timings.H = {
      sum: millis() - t,
      count: 1
    };
  } else {
    timings.H.sum = timings.H.sum + millis() - t;
    timings.H.count = timings.H.count + 1;
  }
}
