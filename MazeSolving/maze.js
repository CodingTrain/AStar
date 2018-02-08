// generates the maze and also solves it using Depth-first Search and Recusive Backtracker




//defines the space between the cells of the grid and also defines the no of rows and cols
var spacing=20;
var cols;
var rows;
var grid;
var startCell;
var endCell;

var openSet=[];
var closedSet=[];
let solvedMaze=false;


//for generating the maze,stores the visited cells,also for backtracking them.
var stack=[];


var current;

var aStarPath=[];

//for tracking the no of unvisited cells
var unvisited;

//generate button
var generate;

var currentCell;

var path=[];



function removeFromArray(arr,cell) {
  for(var i=arr.length-1;i>=0;i--) {
    if(arr[i]==cell) {
      arr.splice(i,1);
    }
  }
}

function heuristic(a,b) {
  var distX=abs(a.j-b.j);
  var distY=abs(a.i-b.i);
  if(distX>distY) {
    return 14*distY+10*(distX-distY);
  }

  return 14 * distX+10*(distY-distX);
}


function setup() {
  createCanvas(600,600);
  //frameRate(10);

  rows=floor(height/spacing);
  cols=floor(width/spacing);

  grid=new Array(rows);
  generate=createButton("Generate Maze");
  for(var i=0;i<grid.length;i++) {
    grid[i]=new Array(cols);
  }

  generateTheMaze();


}

function draw() {
  background(255);

  if(openSet.length>0 && !solvedMaze) {
    var lowestIndex=0;
    for(var i=0;i<openSet.length;i++) {
      if(openSet[i].f<openSet[lowestIndex].f) {
        lowestIndex=i;
      }
    }
    var currCell=openSet[lowestIndex];
    if(currCell===endCell) {
      console.log("Solved");
      solvedMaze=true;
    }
    removeFromArray(openSet,currCell);
    closedSet.push(currCell);
    var neighbors=findTheCorrectNeighbors(currCell.getTheNeighbors(),currCell);

    for(var i=0;i<neighbors.length;i++) {
      var neighbor=neighbors[i];
      if(!closedSet.includes(neighbor)) {
        var tempG=currCell.g+1;
        if(openSet.includes(neighbor)) {
      //was temp better
          if(tempG<neighbor.g) {
            neighbor.g=tempG;
          }
        }else {
          neighbor.g=tempG;
          openSet.push(neighbor);
        }
        neighbor.h=heuristic(neighbor,endCell);
        neighbor.f=neighbor.g+neighbor.h;
        neighbor.previous=currCell;

      }
    }


  }

   //displays the maze
   for(var i=0;i<rows;i++) {
     for(var j=0;j<cols;j++) {
       grid[i][j].show();
     }
  }

   if(!solvedMaze) {
   aStarPath=[];
   var temp=currCell;
   aStarPath.push(temp);
   while(temp.previous!=null) {
     aStarPath.push(temp.previous);
     temp=temp.previous;
   }
  }
   for(var i=0;i<aStarPath.length;i++) {
     fill(0,0,255);
     noStroke();

     rect(4+aStarPath[i].x,4+aStarPath[i].y,spacing/2,spacing/2);
   }

  //generates the maze
  generate.mousePressed(generateTheMaze);
  //displays the path or the solution of the maze
  for(var i=0;i<path.length;i++) {
    fill(0,0,255);
    noStroke();
    rect(4+path[i].x,4+path[i].y,spacing/2,spacing/2);
  }
}


function generateTheMaze() {
  solvedMaze=false;
  //generates the maze using depth first search and recursive backtracker
  path=[];
  aStarPath=[];
  closedSet=[];
  openSet=[];
  for(var i=0;i<rows;i++) {
    for(var j=0;j<cols;j++) {
      grid[i][j]=new Cell(i,j);
    }
  }
  current=grid[0][0];
  currentCell=current;
  grid[0][0].left=false;
  grid[rows-1][cols-1].right=false;
  unvisited=rows*cols-1;
  while(unvisited) {
    var next=current.checkNeighbors();
    if(next) {
      //step2
      stack.push(current);
      //step3
      removeWalls(current,next);
      current=next;
      if(!current.visited) {
        current.visited=true;
        unvisited--;
      }
    } else if(stack.length>0) {
      var back=stack.pop();
      current=back;
    }
  }
  startCell=grid[0][0];
  endCell=grid[rows-1][cols-1];
  openSet.push(startCell);
}




//for removing the walls between the current and the next cell,for the generation of the maze
function removeWalls(curr,next) {
  var i=curr.i-next.i;
  var j=curr.j-next.j;
  if(j===1) {
    curr.left=false;
    next.right=false;
  }else if(j===-1) {
    curr.right=false;
    next.left=false;
  }
  if(i===1) {
      curr.top=false;
      next.bottom=false;
    }else if(i===-1) {
      curr.bottom=false;
      next.top=false;
    }
}


//for tracking the position of the current cell and the neighbors  position,for checking if valid?
function getTheSide(curr,nxt) {
  var i=curr.i-nxt.i;
  var j=curr.j-nxt.j;

  if(j==1) {
    return "left";
  }else if(j==-1) {
    return "right";
  }
  if(i==1) {
    return "above";
  }else if(i==-1) {
    return "below";
  }

  return "null";


}

//getting the correct neighbor from all neighbors
function findTheCorrectNeighbor(neighbors,curr) {
    var bestCell=undefined;
    if(neighbors!=undefined) {
    for(var i=0;i<neighbors.length;i++) {
      var side=getTheSide(curr,neighbors[i]);
      if(isCorrectPic(side,neighbors[i],curr)) {
        bestCell=neighbors[i];
        return bestCell;
      }
    }
  }
}

function findTheCorrectNeighbors(neighbors,curr) {
  var correctNeighbors=[];
  if(neighbors!=undefined) {
  for(var i=0;i<neighbors.length;i++) {
    var side=getTheSide(curr,neighbors[i]);
    if(isCorrectPic(side,neighbors[i],curr)) {
      correctNeighbors.push(neighbors[i]);

    }
  }
  }
  return correctNeighbors;
}


//checking if the choosen neighboring cell  is the correct one
function isCorrectPic(side,neighbor,curr) {
  var correctPic=true;
  if(side==="right") {
    if(neighbor.left  && curr.right) {
      correctPic=false;
    }
  }
  if(side==="left") {
    if(neighbor.right && curr.left) {
      correctPic=false;
    }
  }
  if(side==="above") {
    if(neighbor.bottom && curr.top ) {
      correctPic=false;
    }
  }
  if(side==="below") {
    if(neighbor.top && curr.bottom) {
      correctPic=false;
    }
  }
  return correctPic;
}
