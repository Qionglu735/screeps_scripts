
let mine_port_check = function(main_room_name, room_name) {
    let main_room = Game.rooms[main_room_name];
    let room = Game.rooms[room_name];
    if(room == null) {
        return;
    }
    let main_room_memory = Memory.room_dict[main_room_name];
    let room_memory = Memory.room_dict[room_name];
    if(!["claimed", "reversed"].includes(room_memory.claim_status)) {
        return;
    }
    let need_check_source = false;
    if (Object.keys(room_memory.source).length === 0) {
        console.log(room_name, "no source info");
        need_check_source = true;
    }
    else {
        for (let source_id in room_memory.source) {
            if(room_memory.source.hasOwnProperty(source_id)) {
                if(room_memory.source[source_id].container == null) {
                    console.log(room_name, "no container info in source")
                    need_check_source = true;
                    break;
                }
                else if(!main_room_memory.container_list.includes(room_memory.source[source_id].container)) {
                    console.log(room_name, "no container info in main room")
                    need_check_source = true;
                    break;
                }
                else if(Game.getObjectById(room_memory.source[source_id].container) == null) {
                    console.log(room_name, "container not exist")
                    room_memory.source[source_id].container = null;
                    need_check_source = true;
                    break;
                }
            }
        }
    }
    if(need_check_source) {
        console.log("need_check_source", need_check_source)
        let source_list = room.find(FIND_SOURCES);
        for(let i in source_list) {
            let min_cost = -1;
            let mine_port = null;
            for(let j of main_room_memory.spawn_list) {
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
                        "container": null,
                        "assigned_miner": null,
                    }
                }
                let container_list = mine_port.lookFor(LOOK_STRUCTURES);
                let construction_site_list = mine_port.lookFor(LOOK_CONSTRUCTION_SITES);
                // console.log(room_name, room_memory.claim_status)
                // console.log(["claimed", "reversed"].includes(room_memory.claim_status))
                if (["claimed", "reversed"].includes(room_memory.claim_status)
                    && container_list.length === 0
                    && construction_site_list.length === 0) {  // no contianer or construction site
                    room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                }
                else if(construction_site_list.length > 0) {
                    let container = construction_site_list[0];
                    console.log(room_name, container, source_list[i].id)
                    room_memory.source[source_list[i].id].container = container.id;
                    if(!main_room_memory.container_list.includes(container.id)) {
                        main_room_memory.container_list.push(container.id);
                    }
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
                    if(!main_room_memory.container_list.includes(container.id)) {
                        main_room_memory.container_list.push(container.id);
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
        // unknown bug: room_memory will contain source not in current room
        for(let i in room_memory.source) {
            let found_flag = false;
            for(let j of source_list) {
                if(i === j.id) {
                    found_flag = true;
                    break;
                }
            }
            if(!found_flag) {
                delete room_memory.source[i];
            }
        }
    }
    let need_check_mineral = false;
    if(room.controller.level >= 6) {
        if(Object.keys(room_memory.mineral).length === 0) {
            console.log(room_name, "no mineral info");
            need_check_mineral = true;
        }
        else {
            for(let mineral_id in room_memory.mineral) {
                if(room_memory.mineral.hasOwnProperty(mineral_id)) {
                    if (room_memory.mineral[mineral_id].extractor == null) {
                        console.log(room_name, "no extractor info in mineral");
                        need_check_mineral = true;
                        break;
                    }
                    else if (Game.getObjectById(room_memory.mineral[mineral_id].extractor) == null) {
                        console.log(room_name, "extractor not exist");
                        room_memory.mineral[mineral_id].extractor = null;
                        need_check_mineral = true;
                        break;
                    }
                    else if (room_memory.mineral[mineral_id].container == null) {
                        console.log(room_name, "no container info in mineral");
                        need_check_mineral = true;
                        break;
                    }
                    else if(!main_room_memory.container_list.includes(room_memory.mineral[mineral_id].container)) {
                        console.log(room_name, "no container info in main room")
                        need_check_mineral = true;
                        break;
                    }
                    else if (Game.getObjectById(room_memory.mineral[mineral_id].container) == null) {
                        console.log(room_name, "container not exist");
                        room_memory.mineral[mineral_id].container = null;
                        need_check_mineral = true;
                        break;
                    }
                }
            }
        }
    }
    // if(need_check_flag === false) {
    //     for(let miner_name of main_room_memory.creep.miner.name_list) {
    //         if (Memory.creeps[miner_name].container_id == null) {
    //             console.log(room_name, miner_name, "no container info in miner")
    //             need_check_flag = true;
    //             break;
    //         }
    //     }
    // }
    if(need_check_mineral) {
        console.log("need_check_mineral", need_check_mineral)
        let mineral_list = room.find(FIND_MINERALS);
        for(let i in mineral_list) {
            let min_cost = -1;
            let mine_port = null;
            for(let j of main_room_memory.spawn_list) {
                let res = PathFinder.search(mineral_list[i].pos, Game.spawns[j].pos);
                if(res.incomplete === false && (min_cost === -1 || min_cost > res.cost)) {
                    min_cost = res.cost;
                    mine_port = res.path[0];
                }
            }
            if(min_cost !== -1 && mine_port != null) {
                if(room_memory.source[mineral_list[i].id] == null) {
                    room_memory.mineral[mineral_list[i].id] = {
                        "type": mineral_list[i].mineralType,
                        "extractor": null,
                        "container": null,
                        "assigned_miner": null,
                    }
                }
                // check extractor
                let extractor_list = mineral_list[i].pos.lookFor(LOOK_STRUCTURES);
                let extractor_site_list = mineral_list[i].pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (extractor_list.length === 0 && extractor_site_list.length === 0) {  // no container or construction site
                    room.createConstructionSite(mineral_list[i].pos, STRUCTURE_EXTRACTOR);
                }
                else if(extractor_site_list.length > 0) {
                    let extractor = extractor_site_list[0];
                    room_memory.mineral[mineral_list[i].id].extractor = extractor.id;
                }
                else if(extractor_list.length > 0) {
                    let extractor = extractor_list[0];
                    room_memory.mineral[mineral_list[i].id].extractor = extractor.id;
                }
                // check container
                let container_list = mine_port.lookFor(LOOK_STRUCTURES);
                let container_site_list = mine_port.lookFor(LOOK_CONSTRUCTION_SITES);
                if (container_list.length === 0 && container_site_list.length === 0) {  // no container or construction site
                    // room.createConstructionSite(mine_port, STRUCTURE_CONTAINER);
                }
                else if(container_site_list.length > 0) {
                    let container = container_site_list[0];
                    room_memory.mineral[mineral_list[i].id].container = container.id;
                }
                else if(container_list.length > 0) {
                    let container = container_list[0];
                    room_memory.mineral[mineral_list[i].id].container = container.id;
                    if(!room_memory.container_list.includes(container.id)) {
                        room_memory.container_list.push(container.id);
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
        // for(let i in room_memory.mineral) {
        //     let found_flag = false;
        //     for(let j of mineral_list) {
        //         if(i === j.id) {
        //             found_flag = true;
        //             break;
        //         }
        //     }
        //     if(!found_flag) {
        //         delete room_memory.mineral[i];
        //     }
        // }
    }
};

module.exports = mine_port_check;
