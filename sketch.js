//Set to true to allow diagonal moves
//This will also switch from Manhattan to Euclidean distance measures
var allowDiagonals = false;

function removeFromArray(arr, elt) {
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

function heuristic(a, b) {
    var d;
    if (allowDiagonals) {
        d = dist(a.i, a.j, b.i, b.j);
    } else {
        d = abs(a.i - b.i) + abs(a.j - b.j);
    }
    return d;
}

function TerrainMap(cols, rows, x, y, w, h){
  this.cols = cols;
  this.rows = rows;
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
          this.grid[i][j] = new Spot(i, j, x+i*w/cols, y+j*h/rows, w/cols, h/rows);
      }
  }

  for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
          this.grid[i][j].addNeighbors(this.grid);
      }
  }
}

function Spot(i, j, x, y ,width, height) {
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
    this.wall = false;

    if (random(1) < 0.3) {
        this.wall = true;
    }


    this.show = function(color) {
        fill(color);
        if (this.wall) {
            fill(0);
            noStroke();
            ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2);
        } else {
            rect(this.x, this.y, this.width - 1, this.height - 1);
        }
    }

    this.addNeighbors = function(grid) {
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


function Button(label, x, y, w, h, callback) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.callback = callback;

    this.show = function() {
        stroke(0)
        fill(255);
        rect(x, y, w, h);
        text(label, x, y, w, h);
    }

    this.mouseClick = function(x, y) {
        if (callback != null &&
            x > this.x && x <= this.x + this.w &&
            y > this.y && y <= this.y + this.h) {
            callback();
        }
    }
}


function runpause() {
    paused = !paused;
}

function mouseClicked() {
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].mouseClick(mouseX, mouseY);
    }

}

function doGUI() {
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].show();
    }
}

function PathFinder(map, start, end) {

    this.map = map;
    this.currentBestNode = start;
    this.openSet = [];
    this.openSet.push(start);
    this.closedSet = [];
    this.start = start;
    this.end = end;

    this.step = function() {

        if (this.openSet.length > 0) {

            var winner = 0;
            for (var i = 1; i < this.openSet.length; i++) {
                if (this.openSet[i].f < this.openSet[winner].f) {
                    winner = i;
                }
                //if we have a tie according to the standard heuristic
                if (this.openSet[i].f == this.openSet[winner].f) {
                    //Prefer to explore options with longer known paths (closer to goal)
                    if (this.openSet[i].g > this.openSet[winner].g) {
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
                        if (this.openSet[i].g == this.openSet[winner].g &&
                          this.openSet[i].vh < this.openSet[winner].vh) {
                            winner = i;
                        }
                    }
                }
            }
            var current = this.openSet[winner];

            if (current === this.end) {
                noLoop();
                console.log("DONE!");
            }


            removeFromArray(this.openSet, current);
            this.closedSet.push(current);

            var neighbors = current.neighbors;
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];

                if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
                    var tempG = current.g + heuristic(neighbor, current);

                    var newPath = false;
                    if (this.openSet.includes(neighbor)) {
                        if (tempG < neighbor.g) {
                            neighbor.g = tempG;
                            newPath = true;
                        }
                    } else {
                        neighbor.g = tempG;
                        newPath = true;
                        this.openSet.push(neighbor);
                    }

                    if (newPath) {
                        neighbor.h = heuristic(neighbor, this.end);
                        if (allowDiagonals) {
                            neighbor.vh = visualDist(neighbor, this.end);
                        }
                        neighbor.f = neighbor.g + neighbor.h;
                        neighbor.previous = current;
                    }
                }

            }
            this.currentBestNode = current;
            // we can keep going
        } else {
            console.log('no solution');
            noLoop();
            return;
            // no solution
        }
    }
}

var gamemap;
var buttons = [];
var paused = false;
var pathfinder;

function setup() {
    createCanvas(500, 500);
    console.log('A*');

    var rows = 50;
    var cols = 50;
    gamemap = new TerrainMap(cols,rows,10,10,410,410);
    start = gamemap.grid[0][0];
    end = gamemap.grid[cols-1][rows-1];
    start.wall = false;
    end.wall = false;

    pathfinder = new PathFinder(gamemap,start,end);

    buttons.push(new Button("run/pause", 420, 20, 60, 30, runpause));
    buttons.push(new Button("step", 420, 70, 60, 30, runpause));
    buttons.push(new Button("reset", 420, 120, 60, 30, runpause));

}

function draw() {

    background(255);

    doGUI();

    if (!paused) {
        pathfinder.step();
    }

    for (var i = 0; i < gamemap.cols; i++) {
        for (var j = 0; j < gamemap.rows; j++) {
            gamemap.grid[i][j].show(color(255));
        }
    }


    for (var i = 0; i < pathfinder.closedSet.length; i++) {
        pathfinder.closedSet[i].show(color(255, 0, 0));
    }

    for (var i = 0; i < pathfinder.openSet.length; i++) {
        pathfinder.openSet[i].show(color(0, 255, 0));
    }


    // Find the path
    path = [];
    var temp = pathfinder.currentBestNode;
    path.push(temp);
    while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
    }


    for (var i = 0; i < path.length; i++) {
        //path[i].show(color(0, 0, 255));
    }

    noFill();
    stroke(255, 0, 200);
    strokeWeight(gamemap.w/gamemap.cols / 2);
    beginShape();
    for (var i = 0; i < path.length; i++) {
        vertex(path[i].x + path[i].width / 2, path[i].y + path[i].height / 2);
    }
    endShape();

}
