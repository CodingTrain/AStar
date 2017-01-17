function BspMap(cols, rows, x, y, w, h, allowDiagonals){
    this.cols = cols;
    this.rows = rows;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.allowDiagonals = allowDiagonals;
    this.mainTree;

    this.grid = [];
    this.path = [];
    this.start = {x:0, y:0};
    this.end = {x:cols-1, y:rows-1};

    this.DISCARD_BY_RATIO = true;
    this.H_RATIO = 0.45;
    this.W_RATIO = 0.45;

    this.N_ITERATIONS = 4;

    this.build = function()
    {
        this.grid = [];
        for (var i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (var j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Spot(i, j, x + i * w /this.cols, y + j * h / this.rows, w / this.cols, h / this.rows, true);
            }
        }

        var mainContainer = new Container(1, 1, this.cols-2, this.rows-2);
        this.mainTree = this.splitContainer(mainContainer, this.N_ITERATIONS);

        // Write the rooms into the grid
        var leafs = this.mainTree.getLeafs();
        for(var i= 0; i < leafs.length; i++)
        {
            var room = new Room(leafs[i]);
            room.removeWallsFromGrid(this.grid);
        }
        // Write the halls into the grid
        this.carvePath(this.mainTree, this.grid);
        this.carveEntranceAndExit(this.grid, this.start, this.end);

        //Hook up neighbors
        for (var i = 0; i < this.cols; i++) {
            for (var j = 0; j < this.rows; j++) {
                this.grid[i][j].addNeighbors(this.grid, this.allowDiagonals);
            }
        }
    }

    this.carvePath = function(tree, grid)
    {
        if (tree.lchild == undefined || tree.rchild == undefined){
            return;
        }
        var leftX = floor(tree.lchild.leaf.center.x);
        var leftY = floor(tree.lchild.leaf.center.y);
        var rightX = floor(tree.rchild.leaf.center.x);
        var rightY = floor(tree.rchild.leaf.center.y);

        var x = leftX, y = leftY;
        while(x != rightX)
        {
            grid[x][y].wall = false;
            x += Math.sign(rightX - leftX);
        }
        while(y != rightY)
        {
            grid[x][y].wall = false;
            y += Math.sign(rightY - leftY);
        }

        this.carvePath(tree.lchild, grid);
        this.carvePath(tree.rchild, grid);
    }
    this.carveEntranceAndExit = function(grid, startPoint, endPoint)
    {
        // Entrance
        var x = startPoint.x;
        var y = startPoint.y;
        while(grid[x][y].wall)
        {
            grid[x++][y].wall = false;
            grid[x][y++].wall = false;
        }
        x = endPoint.x;
        y = endPoint.y;
        while(grid[x][y].wall)
        {
            grid[x--][y].wall = false;
            grid[x][y--].wall = false;
        }
    }

    this.random = function(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    this.splitContainer = function(container, iteration)
    {
        var root = new Tree(container);
        if(iteration > 0)
        {
            var sr = this.random_split(container);
            root.lchild = this.splitContainer(sr[0], iteration -1);
            root.rchild = this.splitContainer(sr[1], iteration -1);
        }
        return root;
    }
    this.random_split = function(container) {
        var region1, region2;
        if (this.random(0, 1) == 0) {
            // Vertical
            region1 = new Container(
                container.x, container.y,             // region1.x, region1.y
                this.random(1, container.w), container.h   // region1.w, region1.h
            );
            region2 = new Container(
                container.x + region1.w, container.y,      // region2.x, region2.y
                container.w - region1.w, container.h       // region2.w, region2.h
            );

            if (this.DISCARD_BY_RATIO) {
                var region1_w_ratio = region1.w / region1.h;
                var region2_w_ratio = region2.w / region2.h
                if (region1_w_ratio < this.W_RATIO || region2_w_ratio < this.W_RATIO) {
                    return this.random_split(container);
                }
            }
        } else {
            // Horizontal
            region1 = new Container(
                container.x, container.y,             // region1.x, region1.y
                container.w, this.random(1, container.h)   // region1.w, region1.h
            );
            region2 = new Container(
                container.x, container.y + region1.h,      // region2.x, region2.y
                container.w, container.h - region1.h       // region2.w, region2.h
            );

            if (this.DISCARD_BY_RATIO) {
                var region1_h_ratio = region1.h / region1.w;
                var region2_h_ratio = region2.h / region2.w;
                if (region1_h_ratio < this.H_RATIO || region2_h_ratio < this.H_RATIO) {
                    return this.random_split(container)
                };
            }
        }
        return [region1, region2];
    }

    this.draw = function()
    {
        push();
        scale(this.w/this.cols, this.h/this.rows);
        this.mainTree.draw();
        pop();
    }

    this.build();
}

function Tree(leaf)
{
    this.leaf = leaf;
    this.lchild = undefined;
    this.rchild = undefined;

    this.draw = function()
    {
        var leafs = this.getLeafs();

        for(var i = 0; i<leafs.length; i++)
        {
            leafs[i].draw();
            new Room(leafs[i]).draw();
        }
    }

    this.getLeafs = function()
    {
        if (this.lchild === undefined && this.rchild === undefined)
            return [this.leaf]
        else
            return [].concat(this.lchild.getLeafs(), this.rchild.getLeafs())
    }
}

function Container(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.center = {x:this.x+this.w/2, y:this.y+this.h/2};

    this.draw = function()
    {
        stroke(0,0,255);
        strokeWeight(1);
        noFill();
        rect(this.x, this.y, this.w, this.h);
    }
}

function Room(container)
{
    this.x = container.x + floor(random(0, Math.floor(container.w/3)));
    this.y = container.y + floor(random(0, Math.floor(container.h/3)));
    this.w = container.w - (this.x - container.x);
    this.h = container.h - (this.y - container.y);
    this.w -= floor(random(0, this.w/3));
    this.h -= floor(random(0, this.w/3));

    this.removeWallsFromGrid = function(grid)
    {
        for(var x=this.x; x < this.x + this.w; x++){
            for(var y = this.y; y < this.y + this.h; y++)
            {
                grid[x][y].wall = false;
            }
        }
    }

    this.draw = function()
    {
        fill(0,255,0);
        noStroke();
        rect(this.x, this.y, this.w, this.h);
    }
}