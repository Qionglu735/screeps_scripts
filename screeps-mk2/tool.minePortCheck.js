
var minePortCheck = {
    
    run:function(room, SpawnPos){
        var mines = room.find(FIND_SOURCES);
        var i = 0;
        while(i < mines.length) {
            var res = PathFinder.search(mines[i].pos, Memory.Spawns[0].pos);
            if(res.incomplete == false) {
                Memory.MinePort.push(res.path[0]);
                Memory.MineAssigned.push(false);
                Memory.MineType.push("ENERGY");
                if(res.path[0].lookFor(LOOK_STRUCTURES).length == 0 && res.path[0].lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
                    //room.createConstructionSite(res.path[0], STRUCTURE_CONTAINER);
                }
            }
            i += 1;
        }
        var minerals = room.find(FIND_MINERALS);
        i = 0;
        while(i < minerals.length) {
            var res = PathFinder.search(minerals[i].pos, Memory.Spawns[0].pos);
            if(res.incomplete == false) {
                Memory.MinePort.push(res.path[0]);
                Memory.MineAssigned.push(false);
                Memory.MineType.push(minerals[i].mineralType);
                if(res.path[0].lookFor(LOOK_STRUCTURES).length == 0 && res.path[0].lookFor(LOOK_CONSTRUCTION_SITES).length == 0) {
                    //room.createConstructionSite(res.path[0], STRUCTURE_CONTAINER);
                }
            }
            i += 1;
        }
    }
};

module.exports = minePortCheck;
