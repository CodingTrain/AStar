function AStarPathFinder(map, start, end) {
    this.map = map;
    this.lastCheckedNode = start;
    this.openSet = [];
    // openSet starts with eginning only
    this.openSet.push(start);
    this.closedSet = [];
    this.start = start;
    this.end = end;

    //Run one finding step.
    //returns 0 if search ongoing
    //returns 1 if goal reached
    //returns -1 if no solution
    this.step = function() {

        if (this.openSet.length > 0) {

            // Best next option
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
            this.lastCheckedNode = current;

            // Did I finish?
            if (current === this.end) {
                console.log("DONE!");
                return 1;
            }

            // Best option moves from openSet to closedSet
            removeFromArray(this.openSet, current);
            this.closedSet.push(current);

            // Check all the neighbors
            var neighbors = current.neighbors;
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];

                // Valid next spot?
                if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
                    var tempG = current.g + heuristic(neighbor, current);

                    // Is this a better path than before?
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

                    // Yes, it's a better path
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
            return 0;
            // Uh oh, no solution
        } else {
            console.log('no solution');
            return -1;
        }
    }
}
