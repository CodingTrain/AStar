// The MapFactory keeps track of all possible map generatorsn currently
// contributed, and picks one at random when requested.
//
// To contribute, push your map object function onto the this.maps array,
// as below.

function MapFactory()
{
    this.maps = [];
    this.maps.push(SearchMap); // Simple random map
    this.maps.push(BspMap); // BSP rogue-like map
    this.maps.push(MazeMap);

    this.getMap = function(cols, rows, x, y, w, h, allowDiagonals, percentWalls)
    {
        if(this.maps.length == 0) return undefined;

        var selected = floor(random(this.maps.length));
        return new this.maps[selected](cols, rows, x, y, w, h, allowDiagonals, percentWalls);
    }
}
