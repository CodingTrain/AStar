// This is a Binary Space Partitioning (BSP) map generator strategy,
// tailored to make rogue-like square room dungeons.
// https://en.wikipedia.org/wiki/Binary_space_partitioning
// This could be improved by adding different types of rooms other than
// rectangle spaces, plus the connecting hallways are naive at best.

function BspMap(cols, rows, x, y, w, h, allowDiagonals, percentWalls){
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

    // Initialize the grid
    this.build = function()
    {
        this.grid = [];
        for (var i = 0; i < this.cols; i++) {
            this.grid[i] = [];
            for (var j = 0; j < this.rows; j++) {
                this.grid[i][j] = new Spot(i, j, x + i * w /this.cols, y + j * h / this.rows, w / this.cols, h / this.rows, true, this.grid);
            }
        }

        var mainContainer = new BspContainer(1, 1, this.cols-2, this.rows-2);
        this.mainTree = this.splitContainer(mainContainer, this.N_ITERATIONS);

        // Write the rooms into the grid
        var leafs = this.mainTree.getLeafs();
        for(var i= 0; i < leafs.length; i++)
        {
            var room = new BspRoom(leafs[i]);
            room.removeWallsFromGrid(this.grid);
        }
        // Write the halls into the grid
        this.carvePath(this.mainTree, this.grid);
        this.carveEntranceAndExit(this.grid, this.start, this.end);
    }

    // Carve out the hallways which connect rooms
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

    // Make sure the starting end ending points connect to the rest of the map.
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

    // Inclusive min/max random.
    this.random = function(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // Recursively divide the region until iteration count is met, or the
    // child regions are the right size.
    this.splitContainer = function(container, iteration)
    {
        var root = new BspTree(container);
        if(iteration > 0)
        {
            var sr = this.random_split(container);
            root.lchild = this.splitContainer(sr[0], iteration -1);
            root.rchild = this.splitContainer(sr[1], iteration -1);
        }
        return root;
    }
    // Divide a container region into two child regions
    this.random_split = function(container) {
        var region1, region2;
        if (this.random(0, 1) == 0) {
            // Vertical
            region1 = new BspContainer(
                container.x, container.y,             // region1.x, region1.y
                this.random(1, container.w), container.h   // region1.w, region1.h
            );
            region2 = new BspContainer(
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
            region1 = new BspContainer(
                container.x, container.y,             // region1.x, region1.y
                container.w, this.random(1, container.h)   // region1.w, region1.h
            );
            region2 = new BspContainer(
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

    this.build();
}

// The tree tracks the leaf node (container) and it's partitioned children
function BspTree(leaf)
{
    this.leaf = leaf;
    this.lchild = undefined;
    this.rchild = undefined;

    // returns only leafs which don't have children, as a flat array.
    this.getLeafs = function()
    {
        if (this.lchild === undefined && this.rchild === undefined)
            return [this.leaf]
        else
            return [].concat(this.lchild.getLeafs(), this.rchild.getLeafs())
    }
}

// The container is the partitioned region to put a room into
function BspContainer(x, y, w, h)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.center = {x:this.x+this.w/2, y:this.y+this.h/2};
}

// Used to create the actual room within the container space.
function BspRoom(container)
{
    this.x = container.x + floor(random(0, Math.floor(container.w/3)));
    this.y = container.y + floor(random(0, Math.floor(container.h/3)));
    this.w = container.w - (this.x - container.x);
    this.h = container.h - (this.y - container.y);
    this.w -= floor(random(0, this.w/3));
    this.h -= floor(random(0, this.w/3));

    // We mark the empty spaces for the room
    this.removeWallsFromGrid = function(grid)
    {
        for(var x=this.x; x < this.x + this.w; x++){
            for(var y = this.y; y < this.y + this.h; y++)
            {
                grid[x][y].wall = false;
            }
        }
        this.decorate(grid);
    }
    // This decorator randomly applies obsticles to the room,
    // giving them more personality
    this.decorate = function(grid)
    {
        switch (floor(random(0,10))) {
            case 0:
            case 1:
                this.decorate_columns(grid);
                break;
            case 2:
            case 3:
                this.decorate_circle(grid);
                break;
            default:
                return;
        }
    }
    // Evenly spaced out columns
    this.decorate_columns = function(grid)
    {
        var spacing = floor(random(3,5));
        var cols = this.w / spacing;
        var rows = this.h / spacing;
        for(var x = this.x + 1; x < this.x + this.w - 1; x+=spacing){
            for(var y = this.y + 1; y < this.y + this.h - 1; y+=spacing){
                grid[x][y].wall = true;
            }
        }
    }
    // Hollow circle of random size.  At small resolutions,
    // usually diamond shaped.
    this.decorate_circle = function(grid)
    {
        var radius = floor(random(2,min(this.w/2, this.h/2, 6)));
        var x0 = floor(this.x + this.w/2) + floor(random(-1, 2));
        var y0 = floor(this.y + this.h/2) + floor(random(-1, 2));;

        var x = radius;
        var y = 0;
        var err = 0;

       while (x >= y)
       {
           grid[x0 + x][y0 + y].wall = true;
           grid[x0 + y][y0 + x].wall = true;
           grid[x0 - y][y0 + x].wall = true;
           grid[x0 - x][y0 + y].wall = true;
           grid[x0 - x][y0 - y].wall = true;
           grid[x0 - y][y0 - x].wall = true;
           grid[x0 + y][y0 - x].wall = true;
           grid[x0 + x][y0 - y].wall = true;

           if (err <= 0)
           {
               y += 1;
               err += 2*y + 1;
           }
           if (err > 0)
           {
               x -= 1;
               err -= 2*x + 1;
           }
       }
    }
}
