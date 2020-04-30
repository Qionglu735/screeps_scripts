
var mine_port_check = {
    run:function(room_name){
        var room = Game.rooms[room_name];
        var need_check_flag = false;
        if(Object.keys(Memory.Room[room_name].source).length == 0) {
            need_check_flag = true;
        }
        else if(Object.keys(Memory.Room[room_name].mineral).length == 0) {
            need_check_flag = true;
        }
        else {
            for(var source_id in Memory.Room[room_name].source) {
                if(Memory.Room[room_name].source[source_id].container == null) {
                    need_check_flag = true;
                    break;
                }
                else if(Game.getObjectById(Memory.Room[room_name].source[source_id].container) == null) {
                    Memory.Room[room_name].source[source_id].container = null;
                    need_check_flag = true;
                    break;
                }
            }
            if(need_check_flag != false && room.controller.level >= 6) {
                for(var mineral_id in Memory.Room[room_name].mineral) {
                    if(Memory.Room[room_name].mineral[mineral_id].container == null) {
                        need_check_flag = true;
                        break;
                    }
                    else if(Game.getObjectById(Memory.Room[room_name].mineral[mineral_id].container) == null) {
                        Memory.Room[room_name].mineral[mineral_id].container = null;
                        need_check_flag = true;
                        break;
                    }
                }
            }
        }
        if(need_check_flag) {
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
                        "container": null,
                    }
                    var container_list = res.path[0].lookFor(LOOK_STRUCTURES);
                    var construction_site_list = res.path[0].lookFor(LOOK_CONSTRUCTION_SITES);
                    if(container_list.length == 0 && construction_site_list.length == 0) {
                        room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                    }
                    else if(construction_site_list.length > 0) {
                        var container = construction_site_list[0];
                        Memory.Room[room_name].source[source_list[i].id].container = container.id;
                        Memory.Room[room_name].container_list.push(container.id);
                    }
                    else if(container_list.length > 0) {
                        var container = container_list[0];
                        Memory.Room[room_name].source[source_list[i].id].container = container.id;
                        Memory.Room[room_name].container_list.push(container.id);
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
                        "container": null,
                    }
                    if(room.controller.level >= 6) {
                        var container_list = res.path[0].lookFor(LOOK_STRUCTURES);
                        var construction_site_list = res.path[0].lookFor(LOOK_CONSTRUCTION_SITES);
                        if(container_list.length == 0 && construction_site_list.length == 0) {
                            room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                        }
                        else if(construction_site_list.length > 0) {
                            var container = construction_site_list[0];
                            Memory.Room[room_name].source[source_list[i].id].container = container.id;
                            Memory.Room[room_name].container_list.push(container.id);
                        }
                        else if(container_list.length > 0) {
                            var container = container_list[0];
                            Memory.Room[room_name].source[source_list[i].id].container = container.id;
                            Memory.Room[room_name].container_list.push(container.id);
                        }
                    }
                }
            }
        }
    }
};

module.exports = mine_port_check;
