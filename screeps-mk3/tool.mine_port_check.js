
let mine_port_check = {
    run:function(spawn_name, room_name){
        let room = Game.rooms[room_name];
        let room_memory = Memory.my_spawn[spawn_name].room[room_name];
        let spawn_memory = Memory.my_spawn[spawn_name];
        let need_check_flag = false;
        if (Object.keys(room_memory.source).length === 0) {  // no source info
            need_check_flag = true;
        }
        else if (Object.keys(room_memory.mineral).length === 0) {  // no mineral info
            need_check_flag = true;
        }
        else {
            for (let source_id in room_memory.source) {
                if(room_memory.source.hasOwnProperty(source_id)) {
                    if (room_memory.source[source_id].container == null) {  // no container info in source
                        need_check_flag = true;
                        break;
                    }
                    else if(Game.getObjectById(room_memory.source[source_id].container) == null) {  // container not exist
                        room_memory.source[source_id].container = null;
                        need_check_flag = true;
                        break;
                    }
                }
            }
            if(need_check_flag === false && room.controller.level >= 6) {  // room level >= 6, need to check mineral
                for(let mineral_id in room_memory.mineral) {
                    if(room_memory.mineral.hasOwnProperty(mineral_id)) {
                        if (room_memory.mineral[mineral_id].container == null) {  // no container info in mineral
                            need_check_flag = true;
                            break;
                        }
                        else if (Game.getObjectById(room_memory.mineral[mineral_id].container) == null) {  // container not exist
                            room_memory.mineral[mineral_id].container = null;
                            need_check_flag = true;
                            break;
                        }
                    }
                }
            }
            if(need_check_flag === false) {
                for(let i in Memory.CreepStat.Miner.name_list) {
                    let miner_name = Memory.CreepStat.Miner.name_list[i];
                    if (Memory.creeps[miner_name].container_id == null) {  // no container info in miner
                        need_check_flag = true;
                        break;
                    }
                }
            }
        }
        if(need_check_flag) {
            let source_list = room.find(FIND_SOURCES);
            for(let i in source_list) {
                let min_cost = -1;
                let mine_port = null;
                for(let j in Memory.my_spawn) {
                    let res = PathFinder.search(source_list[i].pos, Game.spawns[j].pos);
                    if(res.incomplete === false && (min_cost === -1 || min_cost > res.cost)) {
                        min_cost = res.cost;
                        mine_port = res.path[0];
                    }
                }
                if(min_cost !== -1 && mine_port != null) {
                    if(room_memory.source[source_list[i].id] == null) {
                        room_memory.source[source_list[i].id] = {
                            "type": RESOURCE_ENERGY,
                            "assigned_miner": null,
                            "container": null,
                        }
                    }
                    let container_list = mine_port.lookFor(LOOK_STRUCTURES);
                    let construction_site_list = mine_port.lookFor(LOOK_CONSTRUCTION_SITES);
                    if (container_list.length === 0 && construction_site_list.length === 0) {  // no contianer or construction site
                        room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                    }
                    else if(construction_site_list.length > 0) {
                        let container = construction_site_list[0];
                        room_memory.source[source_list[i].id].container = container.id;
                        let miner_name = room_memory.source[source_list[i].id].assigned_miner;
                        if(miner_name != null) {
                            if(Memory.creeps[miner_name] == null) {
                                room_memory.source[source_list[i].id].assigned_miner = null;
                            }
                            else {
                                Memory.creeps[miner_name].container_id = container.id;
                            }
                        }
                    }
                    else if(container_list.length > 0) {
                        let container = container_list[0];
                        room_memory.source[source_list[i].id].container = container.id;
                        if(!spawn_memory.container_list.includes(container.id)) {
                            spawn_memory.container_list.push(container.id);
                        }
                        // let miner_name = room_memory.source[source_list[i].id].assigned_miner;
                        // if(miner_name != null) {
                        //     if(Memory.creeps[miner_name] == null) {
                        //         room_memory.source[source_list[i].id].assigned_miner = null;
                        //     }
                        //     else {
                        //         Memory.creeps[miner_name].container_id = container.id;
                        //     }
                        // }
                    }
                }
            }
            let mineral_list = room.find(FIND_MINERALS);
            for(let i in mineral_list) {
                let min_cost = -1;
                let mine_port = null;
                for(let j in Memory.my_spawn) {
                    let res = PathFinder.search(mineral_list[i].pos, Game.spawns[j].pos);
                    if(res.incomplete === false && (min_cost === -1 || min_cost > res.cost)) {
                        min_cost = res.cost;
                        mine_port = res.path[0];
                    }
                }
                if(min_cost !== -1 && mine_port != null) {
                    if(room_memory.source[source_list[i].id] == null) {
                        room_memory.mineral[mineral_list[i].id] = {
                            "type": mineral_list[i].mineralType,
                            "assigned_miner": null,
                            "container": null,
                        }
                    }
                    if(room.controller.level >= 6) {
                        let container_list = mine_port.lookFor(LOOK_STRUCTURES);
                        let construction_site_list = mine_port.lookFor(LOOK_CONSTRUCTION_SITES);
                        if (container_list.length === 0 && construction_site_list.length === 0) {  // no contianer or construction site
                            room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                        }
                        else if(construction_site_list.length > 0) {
                            let container = construction_site_list[0];
                            room_memory.mineral[mineral_list[i].id].container = container.id;
                        }
                        else if(container_list.length > 0) {
                            let container = container_list[0];
                            room_memory.mineral[mineral_list[i].id].container = container.id;
                            if(!spawn_memory.container_list.includes(container.id)) {
                                spawn_memory.container_list.push(container.id);
                            }
                            // let miner_name = room_memory.mineral[mineral_list[i].id].assigned_miner;
                            // if(miner_name != null) {
                            //     if(Memory.creeps[miner_name] == null) {
                            //         room_memory.source[source_list[i].id].assigned_miner = null;
                            //     }
                            //     else {
                            //         Memory.creeps[miner_name].container_id = container.id;
                            //     }
                            // }
                        }
                    }
                }
            }
        }
    }
};

module.exports = mine_port_check;
