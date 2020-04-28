
var mine_port_check = {
    run:function(room_name){
        var room = Game.rooms[room_name];
        var source_list = room.find(FIND_SOURCES);
        for(let i in source_list) {
            var min_cost = -1;
            var mine_port = null;
            for(let j in Memory.Spawn) {
                var res = PathFinder.search(source_list[i].pos, Game.spawns[j].pos);
                if(res.incomplete == false && (min_cost == -1 || min_cost > res.cost)) {
                    min_cost = res.cost;
                    mine_port = res.path[0];
                }
            }
            if(min_cost != -1 && mine_port != null) {
                Memory.Room[room_name].source[source_list[i].id] = {
                    "type": RESOURCE_ENERGY,
                    "mine_port": {
                        "x": mine_port.x,
                        "y": mine_port.y
                    },
                    "assigned_miner": null,
                    "container": null
                }
            }
        }
        var mineral_list = room.find(FIND_MINERALS);
        for(let i in mineral_list) {
            var min_cost = -1;
            var mine_port = null;
            for(let j in Memory.Spawn) {
                var res = PathFinder.search(mineral_list[i].pos, Game.spawns[j].pos);
                if(res.incomplete == false && (min_cost == -1 || min_cost > res.cost)) {
                    min_cost = res.cost;
                    mine_port = res.path[0];
                }
            }
            if(min_cost != -1 && mine_port != null) {
                Memory.Room[room_name].mineral[mineral_list[i].id] = {
                    "type": mineral_list[i].mineralType,
                    "mine_port": {
                        "x": mine_port.x,
                        "y": mine_port.y
                    },
                    "assigned_miner": null,
                    "container": null
                }
            }
        }
    }
};

module.exports = mine_port_check;
