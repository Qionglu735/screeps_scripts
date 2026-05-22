
let room_check = require("tool.room_check");
let mine_port_check = require("tool.mine_port_check");
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let global_manage = function(main_room_name) {
    let cpu = Game.cpu.getUsed();
    let main_room = Game.rooms[main_room_name];
    let main_room_memory = Memory.room_dict[main_room_name];
    let main_spawn = Game.spawns[main_room_memory.spawn_list[0]];
    ////////////////////////////////////////////////////////////////////////////////
    //    Check Room
    room_check(main_room_name);
    // console.log("check room", (Game.cpu.getUsed() - cpu).toFixed(3));
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Container
    for(let i in main_room_memory.container_list) {
        if(main_room_memory.container_list.hasOwnProperty(i)) {
            if(Game.getObjectById(main_room_memory.container_list[i]) == null) {
                main_room_memory.container_list.splice(i, 1);
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Mine
    for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
        mine_port_check(main_room_name, room_name);
    }
    let site_sum = 0
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Extension
    for(let i in main_room_memory.extension_list) {  // check memory status
        if(main_room_memory.extension_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(main_room_memory.extension_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_EXTENSION)) {
                main_room_memory.extension_list.splice(i, 1);
            }
        }
    }
    let extension_num = main_room_memory.extension_list.length;
    let extension_site_num = 0;
    let extension_max = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][main_room.controller.level];
    let extension_capacity = EXTENSION_ENERGY_CAPACITY[main_room.controller.level];
    if (extension_num < extension_max) {  // num < max
        let extension_list = main_room.find(FIND_MY_STRUCTURES, {  // check game status
            filter: (target) => target.structureType === STRUCTURE_EXTENSION
        });
        for (let i in extension_list) {  // update to memory
            if(extension_list.hasOwnProperty(i)) {
                if (!main_room_memory.extension_list.includes(extension_list[i].id)) {
                    main_room_memory.extension_list.push(extension_list[i].id);
                }
            }
        }
        extension_num = main_room_memory.extension_list.length;
        extension_site_num = main_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_EXTENSION
        }).length;
    }
    if (AUTO_BUILD[STRUCTURE_EXTENSION] && extension_num < extension_max) {
        if (site_num + extension_site_num === 0) {  // not constructing
            let extension_pos = main_room_memory.extension_table[extension_num + 1];
            if (extension_pos != null) {
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + extension_pos[0],
                    main_spawn.pos.y + extension_pos[1],
                    main_room.name);
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
                switch(create_status) {
                    case OK:
                        extension_site_num += 1;
                        break;
                    default:
                        console.log("create extension failed:", extension_num + 1, create_status);
                        break;
                }
            }
        }
    }
    site_sum += extension_site_num;
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Storage
    for(let i in main_room_memory.storage_list) {  // check memory status
        if(main_room_memory.storage_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(main_room_memory.storage_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_STORAGE)) {
                main_room_memory.storage_list.splice(i, 1);
            }
        }
    }
    let storage_num = main_room_memory.storage_list.length;
    let storage_site_num = 0;
    let storage_max = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][main_room.controller.level];
    let storage = null;
    if (storage_num < storage_max) {  // num < max
        let storage_list = main_room.find(FIND_MY_STRUCTURES, {  // check game status
            filter: (target) => target.structureType === STRUCTURE_STORAGE
        });
        for(let i in storage_list) {  // update to memory
            if(storage_list.hasOwnProperty(i)) {
                if (!main_room_memory.storage_list.includes(storage_list[i].id)) {
                    main_room_memory.storage_list.push(storage_list[i].id);
                }
            }
        }
        storage_num = main_room_memory.storage_list.length;
        storage_site_num = main_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_STORAGE
        }).length;
    }
    else {
        storage = Game.getObjectById(main_room_memory.storage_list[0]);
    }
    if (AUTO_BUILD[STRUCTURE_STORAGE] && storage_num < storage_max) {
        if(site_sum + storage_site_num === 0) {  // not constructing
            let storage_pos = main_room_memory.storage_table[storage_num + 1];
            if (storage_pos != null) {
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + storage_pos[0],
                    main_spawn.pos.y + storage_pos[1],
                    main_room.name,
                );
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_STORAGE);
                switch (create_status) {
                    case OK:
                        storage_site_num += 1;
                        break;
                    default:
                        console.log("create storage failed:", create_status);
                        break;
                }
            }
        }
    }
    site_sum += storage_site_num;
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Tower
    for(let i in main_room_memory.tower_list) {  // check memory status
        if(main_room_memory.tower_list.hasOwnProperty(i) && main_room_memory.tower_list[i] != null) {
            let obj = Game.getObjectById(main_room_memory.tower_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_TOWER)) {
                main_room_memory.tower_list.splice(i, 1);
            }
        }
    }
    let tower_num = main_room_memory.tower_list.length;
    let tower_site_num = 0;
    let tower_max = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][main_room.controller.level];
    if (tower_num < tower_max) {  // num < max
        let tower_list = main_room.find(FIND_MY_STRUCTURES, {  // check game status
            filter: (target) => target.structureType === STRUCTURE_TOWER
        });
        for(let i in tower_list) {  // update to memory
            if(tower_list.hasOwnProperty(i)) {
                if (!main_room_memory.tower_list.includes(tower_list[i].id)) {
                    main_room_memory.tower_list.push(tower_list[i].id);
                }
            }
        }
        tower_num = main_room_memory.tower_list.length;
        tower_site_num = main_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_TOWER
        }).length;
    }
    if (AUTO_BUILD[STRUCTURE_TOWER] && tower_num < tower_max) {
        if(site_sum + tower_site_num === 0) {  // not constructing
            let tower_table = main_room_memory.tower_table;
            let tower_pos = tower_table[tower_num + 1];
            if (tower_pos != null) {
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + tower_pos[0],
                    main_spawn.pos.y + tower_pos[1],
                    main_room.name
                );
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_TOWER);
                switch (create_status) {
                    case OK:
                        tower_site_num += 1;
                        break;
                    default:
                        console.log("create tower failed:", create_status);
                        break;
                }
            }
        }
    }
    site_sum += tower_site_num;
    // console.log("check s_e_s_t", (Game.cpu.getUsed() - cpu).toFixed(3));
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Link
    for(let i of main_room_memory.link_list) {  // check memory status
        let obj = Game.getObjectById(main_room_memory.link_list[i]);
        if (!(obj && obj.structureType && obj.structureType === STRUCTURE_LINK)) {
            main_room_memory.link_list.splice(i, 1);
        }
    }
    let link_num = main_room_memory.link_list.length;
    let link_site_num = 0;
    let link_max = CONTROLLER_STRUCTURES[STRUCTURE_LINK][main_room.controller.level];
    if (link_num < link_max) {  // num < max
        let link_list = main_room.find(FIND_MY_STRUCTURES, {  // check game status
            filter: (target) => target.structureType === STRUCTURE_LINK
        });
        for(let i of link_list) {  // update to memory
            if (!main_room_memory.link_list.includes(i.id)) {
                main_room_memory.link_list.push(i.id);
            }
        }
        link_num = main_room_memory.link_list.length;
        if(main_room_memory.link_spawn == null || Game.getObjectById(main_room_memory.link_spawn) == null) {  // update spawn link
            main_room_memory.link_spawn = null;
            let link_spawn_list = main_spawn.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (target) => target.structureType === STRUCTURE_LINK,
            });
            if(link_spawn_list.length > 0) {
                main_room_memory.link_spawn = link_spawn.id;
            }
        }
        if(main_room_memory.link_controller == null || Game.getObjectById(main_room_memory.link_controller) == null) {  // update controller link
            main_room_memory.link_controller = null;
            let link_controller_list = main_room.controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (target) => target.structureType === STRUCTURE_LINK,
            });
            if(link_controller_list.length > 0) {
                main_room_memory.link_controller = link_controller_list[0].id;
            }
        }
        link_site_num = main_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_LINK
        }).length;
    }
    if (AUTO_BUILD[STRUCTURE_TOWER] && link_num < link_max) {
        if(site_num + link_site_num === 0) {  // not constructing
            let new_pos = null;
            if (main_room_memory.link_spawn == null) {  // build link near spawn
                if (main_room_memory.link_table["spawn"] != null) {
                    new_pos = new RoomPosition(
                        main_spawn.pos.x + main_room_memory.link_table["spawn"][0],
                        main_spawn.pos.y + main_room_memory.link_table["spawn"][1],
                        main_room.name,
                    );
                }
            }
            else if (main_room_memory.link_controller == null) {  // build link near controller
                let min_cost = -1;
                for(let i of main_room_memory.spawn_list) {
                    let res = PathFinder.search(main_room.controller.pos, Game.spawns[i].pos);
                    if(res.incomplete === false && (min_cost === -1 || min_cost > res.cost)) {
                        min_cost = res.cost;
                        new_pos = res.path[0];
                    }
                }
            }
            if (new_pos != null) {
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_LINK);
                switch (create_status) {
                    case OK:
                        link_site_num += 1;
                        break;
                    default:
                        console.log("[!]", "create link failed:", create_status)
                }
            }
        }
    }
    site_sum += link_site_num;
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Terminal
    for(let i in main_room_memory.terminal_list) {  // check memory status
        if(main_room_memory.terminal_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(main_room_memory.terminal_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_TERMINAL)) {
                main_room_memory.terminal_list.splice(i, 1);
            }
        }
    }
    let terminal_num = main_room_memory.terminal_list.length;
    let terminal_site_num = 0;
    let terminal_max = CONTROLLER_STRUCTURES[STRUCTURE_TERMINAL][main_room.controller.level];;
    let terminal = null;
    if (terminal_num < terminal_max) {  // num < max
        let terminal_list = main_room.find(FIND_MY_STRUCTURES, {  // check game status
            filter: (target) => target.structureType === STRUCTURE_TERMINAL
        });
        for(let i in terminal_list) {  // update to memory
            if(terminal_list.hasOwnProperty(i)) {
                if (!main_room_memory.terminal_list.includes(terminal_list[i].id)) {
                    main_room_memory.terminal_list.push(terminal_list[i].id);
                }
            }
        }
        terminal_num = main_room_memory.terminal_list.length;
        terminal_site_num = main_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_TERMINAL
        }).length;
    }
    else {
        terminal = Game.getObjectById(main_room_memory.terminal_list[0]);
    }
    if (AUTO_BUILD[STRUCTURE_TERMINAL] && terminal_num < terminal_max) {
        if(site_sum + terminal_site_num === 0) {  // not constructing
            let terminal_pos = main_room_memory.terminal_table[terminal_num + 1];
            if (terminal_pos != null) {
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + terminal_pos[0],
                    main_spawn.pos.y + terminal_pos[1],
                    main_room.name);
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_TERMINAL);
                switch (create_status) {
                    case OK:
                        terminal_site_num += 1;
                        break;
                    default:
                        console.log("create terminal failed:", create_status);
                        break;
                }
            }
        }
    }
    site_sum += terminal_site_num;

    // TODO: build factory, lab

    ////////////////////////////////////////////////////////////////////////////////
    ////    Check / Build Road
    cpu = Game.cpu.getUsed();
    let road_site_num = 0;
    if (AUTO_BUILD[STRUCTURE_ROAD] && main_room.controller.level >= 5 && site_sum === 0) {
        let road_to_build = [];
        let main_spawn = Game.spawns[main_room_memory.spawn_list[0]];
        for (let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
            let room_memory = Memory.room_dict[room_name];
            if(room_memory.claim_status === "neutral" || room_memory.hostile_status !== "neutral") {
                continue;
            }
            for (let source_id in room_memory.source) {
                if (room_memory.source.hasOwnProperty(source_id)) {
                    if (room_memory.source[source_id].container != null) {
                        let source_memory = room_memory.source[source_id];
                        if(source_memory.road_to_build == null) {
                            source_memory.road_to_build = [];
                        }
                        if(source_memory.road_built == null) {
                            source_memory.road_built = [];
                        }
                        if (Game.getObjectById(source_memory.container) != null
                            && source_memory.road_to_build.length + source_memory.road_built.length === 0) {  // init
                            let res = PathFinder.search(
                                main_spawn.pos,
                                {
                                    pos: Game.getObjectById(source_memory.container).pos,
                                    range: 1
                                }, {
                                    roomCallback: function (room_name) {
                                        return path_handler.get_cost_matrix(room_name);
                                    }
                                });
                            if (res.incomplete === false) {
                                source_memory.road_to_build = res.path;
                                for (let i in source_memory.road_to_build) {
                                    if(source_memory.road_to_build.hasOwnProperty(i)) {
                                        if(source_memory.road_to_build[i].x === 0
                                            || source_memory.road_to_build[i].x === 49
                                            || source_memory.road_to_build[i].y === 0
                                            || source_memory.road_to_build[i].y === 49) {
                                            source_memory.road_to_build.splice(i, 1)
                                        }
                                    }
                                }
                                source_memory.road_built = [];
                                break;
                            }
                        }
                        if(Game.time % 300 === 0) {
                            for (let i in source_memory.road_built) {  // check road
                                if (source_memory.road_built.hasOwnProperty(i)) {
                                    let obj = Game.getObjectById(source_memory.road_built[i]);
                                    if (!(obj && obj.structureType && obj.structureType === STRUCTURE_ROAD)) {
                                        source_memory.road_built.splice(i, 1);
                                    }
                                }
                            }
                        }
                        for (let i in source_memory.road_to_build) {
                            if(source_memory.road_to_build.hasOwnProperty(i)) {
                                if(source_memory.road_to_build[i].x === 0
                                    || source_memory.road_to_build[i].x === 49
                                    || source_memory.road_to_build[i].y === 0
                                    || source_memory.road_to_build[i].y === 49) {
                                    source_memory.road_to_build.splice(i, 1)
                                }
                            }
                        }
                        if (source_memory.road_to_build.length > source_memory.road_built.length) {  // build road
                            for(let i of source_memory.road_to_build) {
                                let room = Game.rooms[i.roomName];
                                if (room == null) {
                                    continue;
                                }
                                room.visual.circle(i.x, i.y, {fill: "#80ff82", radius: 0.1, opacity: 1});
                            }
                            for(let i of source_memory.road_to_build) {
                                let road_pos = new RoomPosition(i.x, i.y, i.roomName);
                                let room = Game.rooms[road_pos.roomName];
                                if (room == null) {
                                    continue;
                                }
                                let road_list = road_pos.lookFor(LOOK_STRUCTURES);
                                if (road_list.length === 0) {  // road not found
                                    road_to_build.push(road_pos);
                                    if(road_to_build.length > 2) {
                                        break;
                                    }
                                } else {
                                    if (!source_memory.road_built.includes(road_list[0].id)) {
                                        source_memory.road_built.push(road_list[0].id);
                                    }
                                }
                            }
                            if(road_to_build > 2) {
                                break;
                            }
                        }
                    }
                }
            }
            if(road_site_num > 2) {
                break;
            }
            if(main_room.controller.level >= 6) {  // room level >= 6, need to check mineral
                for(let mineral_id in room_memory.mineral) {
                    if(room_memory.mineral.hasOwnProperty(mineral_id)) {
                        if (room_memory.mineral[mineral_id].container != null) {
                            let mineral_memory = room_memory.mineral[mineral_id];
                            if(mineral_memory.road_to_build == null) {
                                mineral_memory.road_to_build = [];
                            }
                            if(mineral_memory.road_built == null) {
                                mineral_memory.road_built = [];
                            }
                            if (Game.getObjectById(mineral_memory.container) != null
                                && mineral_memory.road_to_build.length + mineral_memory.road_built.length === 0) {  // init
                                let res = PathFinder.search(
                                    main_spawn.pos,
                                    {
                                        pos: Game.getObjectById(mineral_memory.container).pos,
                                        range: 1
                                    }, {
                                        roomCallback: function (room_name) {
                                            return path_handler.get_cost_matrix(room_name);
                                        }
                                    });
                                if (res.incomplete === false) {
                                    mineral_memory.road_to_build = res.path;
                                    for (let i in mineral_memory.road_to_build) {
                                        if(mineral_memory.road_to_build.hasOwnProperty(i)) {
                                            if(mineral_memory.road_to_build[i].x === 0
                                                || mineral_memory.road_to_build[i].x === 49
                                                || mineral_memory.road_to_build[i].y === 0
                                                || mineral_memory.road_to_build[i].y === 49) {
                                                mineral_memory.road_to_build.splice(i, 1)
                                            }
                                        }
                                    }
                                    mineral_memory.road_built = [];
                                    break;
                                }
                            }
                            if(Game.time % 300 === 0) {
                                for (let i in mineral_memory.road_built) {  // check road
                                    if (mineral_memory.road_built.hasOwnProperty(i)) {
                                        let obj = Game.getObjectById(mineral_memory.road_built[i]);
                                        if (!(obj && obj.structureType && obj.structureType === STRUCTURE_ROAD)) {
                                            mineral_memory.road_built.splice(i, 1);
                                        }
                                    }
                                }
                            }
                            for (let i in mineral_memory.road_to_build) {
                                if(mineral_memory.road_to_build.hasOwnProperty(i)) {
                                    if(mineral_memory.road_to_build[i].x === 0
                                        || mineral_memory.road_to_build[i].x === 49
                                        || mineral_memory.road_to_build[i].y === 0
                                        || mineral_memory.road_to_build[i].y === 49) {
                                        mineral_memory.road_to_build.splice(i, 1)
                                    }
                                }
                            }
                            if (mineral_memory.road_to_build.length > mineral_memory.road_built.length) {  // build road
                                for(let i of mineral_memory.road_to_build) {
                                    let room = Game.rooms[i.roomName];
                                    if (room == null) {
                                        continue;
                                    }
                                    room.visual.circle(i.x, i.y, {fill: "#80ff82", radius: 0.1, opacity: 1});
                                }
                                for(let i of mineral_memory.road_to_build) {
                                    let road_pos = new RoomPosition(i.x, i.y, i.roomName);
                                    let room = Game.rooms[road_pos.roomName];
                                    if (room == null) {
                                        continue;
                                    }
                                    let road_list = road_pos.lookFor(LOOK_STRUCTURES);
                                    if (road_list.length === 0) {  // road not found
                                        road_to_build.push(road_pos);
                                        if(road_to_build.length > 2) {
                                            break;
                                        }
                                    } else {
                                        if (!mineral_memory.road_built.includes(road_list[0].id)) {
                                            mineral_memory.road_built.push(road_list[0].id);
                                        }
                                    }
                                }
                                if(road_to_build > 2) {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        if(road_to_build.length > 0) {
            road_site_num = global_find.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (target) => target.structureType === STRUCTURE_ROAD}).length;
            let i = 0;
            while (road_site_num < 2 && i < road_to_build.length) {
                let road_pos = road_to_build[i];
                let room = Game.rooms[road_pos.roomName];
                if (room == null) {
                    continue;
                }
                room.createConstructionSite(road_pos, STRUCTURE_ROAD);
                road_site_num += 1;
                i += 1;
            }
        }
    }
    // site_sum += road_site_num;
    if(LOG_USED_TIME) {
        console.log("check road", (Game.cpu.getUsed() - cpu).toFixed(3));
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Update Cost Matrix per 10 min
    cpu = Game.cpu.getUsed();
    if (site_sum === 0 && Game.time % 600 === 0) {
        for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
            console.log(room_name, "update cost matrix")
            path_handler.get_cost_matrix(room_name, 1);
        }
    }
    if(LOG_USED_TIME) {
        console.log("update matrix", (Game.cpu.getUsed() - cpu).toFixed(3));
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Adjust Worker Number
    ////    adjust harvester number
    main_room_memory.creep.harvester.max_num = 2;
    ////    adjust miner number
    let energy_mine_num = 0, mineral_mine_num = 0;
    main_room_memory.creep.miner.max_num = 0;
    let room_name_list = [main_room_name];
    if (storage != null && storage.store[RESOURCE_ENERGY] < storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY] * 0.9) {
        room_name_list = room_name_list.concat(main_room_nmemory.sub_room_list);
    }
    for(let room_name of room_name_list) {
        if(!["claimed", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
            continue;
        }
        for (let source_id in Memory.room_dict[room_name].source) {
            if (Memory.room_dict[room_name].source.hasOwnProperty(source_id)) {
                let source = Game.getObjectById(source_id);
                if (source != null && source.energy === 0) {
                    continue;
                }
                let source_info = Memory.room_dict[room_name].source[source_id];
                energy_mine_num += 1;
                // miner / mine port assignment
                if (source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                    Memory.room_dict[room_name].source[source_id].assigned_miner = null;
                    for (let miner_name of main_room_memory.creep.miner.name_list) {
                        if (Memory.creeps[miner_name].target_id == null) {  // idle miner
                            Memory.creeps[miner_name].target_id = source_id;
                            Memory.creeps[miner_name].container_id = source_info.container;
                            Memory.room_dict[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        } 
                        else if (Memory.creeps[miner_name].target_id === source_id) {  // miner already assigned
                            Memory.room_dict[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        }
                    }
                }
                else {  // check miner memory
                    let miner_name = source_info.assigned_miner;
                    if (Memory.creeps[miner_name].target_id == null || Memory.creeps[miner_name].target_id !== source_id) {
                        Memory.creeps[miner_name].target_id = source_id;
                    }
                    if (Memory.creeps[miner_name].container_id == null || Memory.creeps[miner_name].container_id !== source_info.container) {
                        Memory.creeps[miner_name].container_id = source_info.container;
                    }
                }
            }
        }
        if(room_name == main_room_name && Game.rooms[room_name].controller.level >= 6) {
            for(let mineral_id in Memory.room_dict[room_name].mineral) {
                if(Memory.room_dict[room_name].mineral.hasOwnProperty(mineral_id)) {
                    let mineral = Game.getObjectById(mineral_id);
                    if (mineral != null && mineral.mineralAmount === 0) {
                        continue;
                    }
                    mineral_mine_num += 1;
                    let mineral_info = Memory.room_dict[room_name].mineral[mineral_id];
                    let extractor = Game.getObjectById(mineral_info.extractor);
                    let container = Game.getObjectById(mineral_info.container);
                    if(extractor != null && extractor.progress != null
                        || container != null && container.progress != null
                    ) {
                        continue;  // extractor and container are not ready
                    }
                    main_room_memory.creep.miner.max_num += 1;
                    // miner / mine port assignment
                    if (mineral_info.assigned_miner == null || Game.creeps[mineral_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                        Memory.room_dict[room_name].mineral[mineral_id].assigned_miner = null;
                        for (let miner_name of main_room_memory.creep.miner.name_list) {
                            if (Memory.creeps[miner_name].target_id == null) {  // idle miner
                                Memory.creeps[miner_name].target_id = mineral_id;
                                Memory.creeps[miner_name].extractor_id = mineral_info.extractor;
                                Memory.creeps[miner_name].container_id = mineral_info.container;
                                Memory.room_dict[room_name].mineral[mineral_id].assigned_miner = miner_name;
                                break;
                            }
                            else if (Memory.creeps[miner_name].target_id === mineral_id) {  // miner already assigned
                                Memory.room_dict[room_name].mineral[mineral_id].assigned_miner = miner_name;
                                break;
                            }
                        }
                    }
                    else {  // check miner memory
                        let miner_name = mineral_info.assigned_miner;
                        if (Memory.creeps[miner_name].target_id == null
                            || Memory.creeps[miner_name].target_id !== mineral_id) {
                            Memory.creeps[miner_name].target_id = mineral_id;
                        }
                        if (Memory.creeps[miner_name].extractor_id == null) {
                            Memory.creeps[miner_name].extractor_id = mineral_info.extractor;
                        }
                        if (Memory.creeps[miner_name].container_id == null) {
                            Memory.creeps[miner_name].container_id = mineral_info.container;
                        }
                    }
                }
            }
        }
    }
    main_room_memory.creep.miner.max_num = energy_mine_num + mineral_mine_num;
    ////    adjust carrier number
    main_room_memory.creep.carrier.max_num = 0;
    for(let i in main_room_memory.container_list) {
        if(main_room_memory.container_list.hasOwnProperty(i)) {
            let container = Game.getObjectById(main_room_memory.container_list[i]);
            if(container != null && container.progress == null) {
                if (container.pos.roomName === main_room_name) {
                    main_room_memory.creep.carrier.max_num += 1;
                }
                else {
                    main_room_memory.creep.carrier.max_num += 1;
                }
            }
        }
    }
    main_room_memory.creep.carrier.type_list = [];
    for (let carrier_name of main_room_memory.creep.carrier.name_list) {
        let _type = Memory.creeps[carrier_name].type;
        if(_type) {
            main_room_memory.creep.carrier.type_list.push(_type);
        }
    }
    main_room_memory.creep.carrier.energy_carrier_max = 0;
    if (storage == null) {
        main_room_memory.creep.carrier.energy_carrier_max += Math.min(main_room_memory.extension_list.length, main_room_memory.creep.carrier.max_num);
    }
    else {
        let energy_empty_rate = Math.max(0, 1 - storage.store[RESOURCE_ENERGY] / (storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY]));
        // console.log("energy_empty_rate:", energy_empty_rate.toFixed(2), Math.log2(1 + energy_empty_rate * 100).toFixed(2));
        main_room_memory.creep.carrier.energy_carrier_max += 1 + Math.ceil(Math.log2(1 +energy_empty_rate * 100));
    }
    main_room_memory.creep.carrier.energy_carrier_max = Math.min(main_room_memory.creep.carrier.energy_carrier_max, energy_mine_num);
    main_room_memory.creep.carrier.mineral_carrier_max = 0;
    if (Game.rooms[main_room_name].controller.level >= 6) {
        for(let mineral_id in main_room_memory.mineral) {
            if(main_room_memory.mineral.hasOwnProperty(mineral_id)) {
                let mineral = Game.getObjectById(mineral_id);
                if (mineral != null && mineral.mineralAmount === 0) {
                    continue;
                }
                mineral_mine_num += 1;
                let mineral_info = main_room_memory.mineral[mineral_id];
                let extractor = Game.getObjectById(mineral_info.extractor);
                let container = Game.getObjectById(mineral_info.container);
                if (extractor != null && extractor.progress != null
                    || container != null && container.progress != null
                ) {
                    continue;  // extractor and container are not ready
                }
                main_room_memory.creep.carrier.mineral_carrier_max += 1;
            }
        }
    }
    main_room_memory.creep.carrier.mineral_carrier_max = Math.min(main_room_memory.creep.carrier.mineral_carrier_max, mineral_mine_num);
    main_room_memory.creep.carrier.max_num = main_room_memory.creep.carrier.energy_carrier_max + main_room_memory.creep.carrier.mineral_carrier_max;
    ////    adjust refueler number
    main_room_memory.creep.refueler.max_num = 0;
    if(main_room.controller.level >= 4 && main_room_memory.storage_list.length > 0) {
        main_room_memory.creep.refueler.max_num =
            main_room_memory.tower_list.length + main_room_memory.link_list.length;
    }
    ////    TODO: adjust builder number
    // main_room_memory.creep.builder.max_num = 1;
    ////    adjust scout number
    main_room_memory.creep.scout.max_num = 0;
    if(main_room.controller.level >= 4) {
        main_room_memory.creep.scout.max_num = 1;
    }
    ////    adjust claimer number
    main_room_memory.creep.claimer.max_num = 0;
    if (storage != null && storage.store[RESOURCE_ENERGY] < storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY] * 0.9) {
        for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
            if(["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
                main_room_memory.creep.claimer.max_num += 1;
            }
        }
    }
    ////    adjust dealer number
    main_room_memory.creep.dealer.max_num = 0;
    if(main_room.controller.level >= 6 && Memory.active_market_order != null) {
        main_room_memory.creep.dealer.max_num = 1
    }
    ////    adjust upgrader number
    // main_room_memory.creep.upgrader.max_num = 0;  // reset
    if (main_room.controller.level < CONTROL_LEVEL_LIMIT 
        || main_room.controller.progress / main_room.controller.progressTotal < 0.5
        || main_room.controller.ticksToDowngrade / CONTROLLER_DOWNGRADE[main_room.controller.level] < 0.4
    ) {
        if(main_room_memory.creep.upgrader.name_list.length >= main_room_memory.creep.upgrader.max_num
            && site_sum === 0
            && main_room_memory.spawn_idle_time >= 10 * main_room.controller.level
            && main_room_memory.creep.upgrader.max_num <= 9
        ) {
            main_room_memory.creep.upgrader.max_num += 1;
        }
        else if(main_room_memory.creep.upgrader.name_list.length <= main_room_memory.creep.upgrader.max_num
            && main_room_memory.spawn_busy_time >= 60 * main_room.controller.level
            && main_room_memory.creep.upgrader.max_num > 0
        ) {
            main_room_memory.creep.upgrader.max_num -= 1;
        }
    }
    else {
        main_room_memory.creep.upgrader.max_num = 0;
    }
    // if(storage_num === 0) {
    //
    // }
    // else if(main_room_memory.creep.upgrader.name_list.length < main_room_memory.creep.upgrader.max_num
    //     && main_room_memory.energy_stat["3600_tick_sum_trend"] < 50) {
    //     // energy decreasing in 1 hour: half upgrader number
    //     main_room_memory.creep.upgrader.max_num = Math.floor(parseInt(main_room_memory.creep.upgrader.max_num) / 2);
    //     if(main_room_memory.creep.upgrader.max_num === 0) {
    //         main_room_memory.creep.upgrader.max_num = 1;
    //     }
    // }
    // else if(main_room_memory.creep.upgrader.name_list.length === main_room_memory.creep.upgrader.max_num
    //     && main_room_memory.spawn_cool_down === 0) {
    //     // upgrader num already at maximum number, spawn is idle
    //     if(main_room.energyAvailable === 300 + extension_num * extension_capacity
    //         && main_room_memory.creep.upgrader.max_num <= main_room.controller.level * 3
    //         && Memory.cpu_stat["600_tick_avg"] < 5
    //         && main_room_memory.energy_stat["600_tick_sum_trend"] > 50) {
    //         // spawn energy at maximum, cpu < 5 in 10 min, energy increasing in 10 min
    //         main_room_memory.creep.upgrader.max_num += 1;
    //     }
    //     else if(main_room.energyAvailable === 300 + extension_num * extension_capacity
    //         && main_room_memory.creep.upgrader.max_num <= main_room.controller.level
    //         && Memory.cpu_stat["3600_tick_avg"] < 15
    //         && (main_room_memory.energy_stat["3600_tick_sum_trend"] > 50
    //             || main_room.energyAvailable > 800000)) {
    //         // spawn energy at maximum, cpu < 15 in 1 hour, energy increasing in 1 hour
    //         main_room_memory.creep.upgrader.max_num += 1;
    //     }
    //     else if(Memory.cpu_stat["3600_tick_avg"] > 15
    //         && main_room_memory.creep.upgrader.max_num > 1) {
    //         // cpu > 15 in 1 hour
    //         main_room_memory.creep.upgrader.max_num -= 1;
    //     }
    //     else if(Memory.cpu_stat["3600_tick_sum_trend"] < 50
    //         && main_room_memory.creep.upgrader.max_num > 1) {
    //         // energy decreasing in 1 hour
    //         main_room_memory.creep.upgrader.max_num -= 1;
    //     }
    // }
    console.log(
        `[Creep]`,
        `H:${main_room_memory.creep.harvester.name_list.length}/${main_room_memory.creep.harvester.max_num}(${main_room_memory.creep.harvester.avg_level})`,
        `M:${main_room_memory.creep.miner.name_list.length}/${main_room_memory.creep.miner.max_num}(${main_room_memory.creep.miner.avg_level})`,
        `U:${main_room_memory.creep.upgrader.name_list.length}/${main_room_memory.creep.upgrader.max_num}(${main_room_memory.creep.upgrader.avg_level})`,
        `C:${main_room_memory.creep.carrier.name_list.length}/${main_room_memory.creep.carrier.max_num}(${main_room_memory.creep.carrier.avg_level})`,
        `R:${main_room_memory.creep.refueler.name_list.length}/${main_room_memory.creep.refueler.max_num}(${main_room_memory.creep.refueler.avg_level})`,
        `S:${main_room_memory.creep.scout.name_list.length}/${main_room_memory.creep.scout.max_num}(${main_room_memory.creep.scout.avg_level})`,
        `CL:${main_room_memory.creep.claimer.name_list.length}/${main_room_memory.creep.claimer.max_num}(${main_room_memory.creep.claimer.avg_level})`,
        `D:${main_room_memory.creep.dealer.name_list.length}/${main_room_memory.creep.dealer.max_num}(${main_room_memory.creep.dealer.avg_level})`,
    );

    // if(Game.cpu.bucket >= 5000){
    //     Game.cpu.generatePixel();
    // }
};

module.exports = global_manage;
