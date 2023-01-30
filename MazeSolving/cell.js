function Cell(i,j) {
    //row no
    this.i=i;
    //col no
    this.j=j;
    //x and y for display
    this.x=this.j*spacing;
    this.y=this.i*spacing;

    //for removing the walls,and keeping track of all the walls of the cell
    this.left=true;
    this.right=true;
    this.top=true;
    this.bottom=true;
    //for the generating the maze,keeps track of the visited cell
    this.visited=false;

    //for solving the maze,keeps track of visited cell
    this.explored=false;

    this.g=0;
    this.f=0;
    this.h=0;

    this.previous=null;



    this.show=function() {
      stroke(0);
      strokeWeight(2);
      noFill();
      if(this.left) {
        line(this.x,this.y,this.x,this.y+spacing);
      }
      if(this.right) {
        line(this.x+spacing,this.y,this.x+spacing,this.y+spacing);
      }
      if(this.top) {
        line(this.x,this.y,this.x+spacing,this.y);
      }
      if(this.bottom) {
        line(this.x,this.y+spacing,this.x+spacing,this.y+spacing);
      }

    }


    this.checkNeighbors=function() {
      var neighbors=[];
      if(this.i>0) {
        var top=grid[this.i-1][this.j];
      }
      if(this.i<rows-1) {
        var bottom=grid[this.i+1][this.j];
      }
      if(j>0) {
        var left=grid[this.i][this.j-1];
      }
      if(j<rows-1) {
        var right=grid[this.i][this.j+1];
      }

      if(top && !top.visited) {
        neighbors.push(top);
      }
      if(bottom && !bottom.visited) {
        neighbors.push(bottom);
      }
      if(left && !left.visited) {
        neighbors.push(left);
      }
      if(right && !right.visited) {
        neighbors.push(right);
      }

      if(neighbors.length>0) {
        var index=floor(random(0,neighbors.length));
        return neighbors[index];
      }else {
        return undefined;
      }

    }

    this.getTheNeighbors=function() {
      var neighbors=[];
      if(this.i>0) {
        var top=grid[this.i-1][this.j];
      }
      if(this.i<rows-1) {
        var bottom=grid[this.i+1][this.j];
      }
      if(this.j>0) {
        var left=grid[this.i][this.j-1];
      }
      if(this.j<cols-1) {
        var right=grid[this.i][this.j+1];
      }

      if(top && !top.explored) {
        neighbors.push(top);
      }
      if(bottom && !bottom.explored) {
        neighbors.push(bottom);
      }
      if(left && !left.explored) {
        neighbors.push(left);
      }
      if(right && !right.explored) {
        neighbors.push(right);
      }
      if(neighbors.length>0) {
        return neighbors;
      }else {
        return undefined;
      }

    }
    this.highlight=function() {
      noStroke();
      fill(255,0,0);
      rect(this.x,this.y,spacing-10,spacing-10);
    }


}
