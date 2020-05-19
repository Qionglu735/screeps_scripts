
var mine_port_check = {
    run:function(spawn_name, room_name){
        var room = Game.rooms[room_name];
        var room_memory = Memory.my_spawn[spawn_name].room[room_name];
        var need_check_flag = false;
        if(Object.keys(room_memory.source).length == 0) {
            need_check_flag = true;
        }
        else if(Object.keys(room_memory.mineral).length == 0) {
            need_check_flag = true;
        }
        else {
            for(var source_id in room_memory.source) {
                if(room_memory.source[source_id].container == null) {
                    need_check_flag = true;
                    break;
                }
                else if(Game.getObjectById(room_memory.source[source_id].container) == null) {
                    room_memory.source[source_id].container = null;
                    need_check_flag = true;
                    break;
                }
            }
            if(need_check_flag == false && room.controller.level >= 6) {
                for(var mineral_id in room_memory.mineral) {
                    if(room_memory.mineral[mineral_id].container == null) {
                        need_check_flag = true;
                        break;
                    }
                    else if(Game.getObjectById(room_memory.mineral[mineral_id].container) == null) {
                        room_memory.mineral[mineral_id].container = null;
                        need_check_flag = true;
                        break;
                    }
                }
            }
            if(need_check_flag == false) {
                for(var i in Memory.CreepStat.Miner.name_list) {
                    var miner_name = Memory.CreepStat.Miner.name_list[i];
                    if(Memory.creeps[miner_name].container_id == null) {
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
                    if(room_memory.source[source_list[i].id] == null) {
                        room_memory.source[source_list[i].id] = {
                            "type": RESOURCE_ENERGY,
                            "assigned_miner": null,
                            "container": null,
                        }
                    }
                    var container_list = res.path[0].lookFor(LOOK_STRUCTURES);
                    var construction_site_list = res.path[0].lookFor(LOOK_CONSTRUCTION_SITES);
                    if(container_list.length == 0 && construction_site_list.length == 0) {
                        room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                    }
                    else if(construction_site_list.length > 0) {
                        var container = construction_site_list[0];
                        room_memory.source[source_list[i].id].container = container.id;
//                        if(!room_memory.container_list.includes(container.id)) {
//                            room_memory.container_list.push(container.id);
//                        }
                    }
                    else if(container_list.length > 0) {
                        var container = container_list[0];
                        room_memory.source[source_list[i].id].container = container.id;
                        if(!room_memory.container_list.includes(container.id)) {
                            room_memory.container_list.push(container.id);
                        }
                        var miner_name = room_memory.source[source_list[i].id].assigned_miner;
                        if(miner_name != null) {
                            if(Memory.creeps[miner_name] == null) {
                                room_memory.source[source_list[i].id].assigned_miner = null;
                            }
                            else {
                                Memory.creeps[miner_name].container_id = container.id;
                            }
                        }
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
                    if(room_memory.source[source_list[i].id] == null) {
                        room_memory.mineral[mineral_list[i].id] = {
                            "type": mineral_list[i].mineralType,
                            "assigned_miner": null,
                            "container": null,
                        }
                    }
                    if(room.controller.level >= 6) {
                        var container_list = res.path[0].lookFor(LOOK_STRUCTURES);
                        var construction_site_list = res.path[0].lookFor(LOOK_CONSTRUCTION_SITES);
                        if(container_list.length == 0 && construction_site_list.length == 0) {
                            room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                        }
                        else if(construction_site_list.length > 0) {
                            var container = construction_site_list[0];
                            room_memory.mineral[mineral_list[i].id].container = container.id;
//                            if(!room_memory.container_list.includes(container.id)) {
//                                room_memory.container_list.push(container.id);
//                            }
                        }
                        else if(container_list.length > 0) {
                            var container = container_list[0];
                            room_memory.mineral[mineral_list[i].id].container = container.id;
                            if(!room_memory.container_list.includes(container.id)) {
                                room_memory.container_list.push(container.id);
                            }
                            var miner_name = room_memory.mineral[mineral_list[i].id].assigned_miner;
                            if(miner_name != null) {
                                if(Memory.creeps[miner_name] == null) {
                                    room_memory.source[source_list[i].id].assigned_miner = null;
                                }
                                else {
                                    Memory.creeps[miner_name].container_id = container.id;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

module.exports = mine_port_check;
