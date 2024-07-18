
require("constant");

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
    // for(let room_name of Memory.room_list) {
    //
    // }
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
    let extension_max = 0;
    let extension_capacity = 50;
    switch(main_room.controller.level) {
        case 2:
            extension_max = 5;
            break;
        case 3:
            extension_max = 10;
            break;
        case 4:
            extension_max = 20;
            break;
        case 5:
            extension_max = 30;
            break;
        case 6:
            extension_max = 40;
            break;
        case 7:
            extension_max = 50;
            extension_capacity = 100;
            break;
        case 8:
            extension_max = 60;
            extension_capacity = 200;
            break;
    }
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
        if(extension_site_num === 0) {  // not constructing
            if(extension_num < extension_max) {
                let extension_table = main_room_memory.extension_table;
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + extension_table[extension_num + 1][0],
                    main_spawn.pos.y + extension_table[extension_num + 1][1],
                    main_room.name);
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
                switch(create_status) {
                    case OK:
                        extension_site_num += 1;
                        break;
                    default:
                        console.log("create extension failed:", extension_num + 1, create_status)
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
    let storage_max = 0;
    let storage = null;
    if(main_room.controller.level >= 4) {
        storage_max = 1;
    }
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
        if(storage_site_num === 0) {  // not constructing
            if (storage_num < storage_max && site_sum === 0) {
                let storage_pos = main_room_memory.storage_table["1"];
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + storage_pos[0],
                    main_spawn.pos.y + storage_pos[1],
                    main_room.name);
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_STORAGE);
                switch (create_status) {
                    case OK:
                        storage_site_num += 1;
                        break;
                    default:
                        console.log("create storage failed:", create_status)
                }
            }
        }
    }
    else {
        storage = Game.getObjectById(main_room_memory.storage_list[0]);
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
    let tower_max = 0;
    switch (main_room.controller.level) {
        case 3:
        case 4:
            tower_max = 1;
            break;
        case 5:
        case 6:
            tower_max = 2;
            break;
        case 7:
            tower_max = 3;
            break;
        case 8:
            tower_max = 6;
            break;
    }
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
        if(tower_site_num === 0) {  // not constructing
            if (tower_num < tower_max && site_sum === 0) {
                let tower_table = main_room_memory.tower_table;
                let new_pos = new RoomPosition(
                    main_spawn.pos.x + tower_table[tower_num + 1][0],
                    main_spawn.pos.y + tower_table[tower_num + 1][1],
                    main_room.name);
                let create_status = main_room.createConstructionSite(new_pos, STRUCTURE_TOWER);
                switch (create_status) {
                    case OK:
                        tower_site_num += 1;
                        break;
                    default:
                        console.log("create tower failed:", create_status)
                }
            }
        }
    }
    site_sum += tower_site_num;
    // console.log("check s_e_s_t", (Game.cpu.getUsed() - cpu).toFixed(3));
    // TODO: build terminal, link, lab
    // check link
    if(main_room.controller.level >= 5) {
        if(main_room_memory.link_spawn == null || Game.getObjectById(main_room_memory.link_spawn) == null) {
            let main_spawn = Game.spawns[main_room_memory.spawn_list[0]];
            let link_spawn = main_spawn.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: target => target.structureType === STRUCTURE_LINK
            })
            if(link_spawn != null) {
                main_room_memory.link_spawn = link_spawn.id;
            }
        }
        if(main_room_memory.link_controller == null || Game.getObjectById(main_room_memory.link_spawn) == null) {
            let controller = main_room.controller;
            let link_controller = controller.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: target => target.structureType === STRUCTURE_LINK
            })
            if(link_controller != null) {
                main_room_memory.link_controller = link_controller.id;
            }
        }
        if(main_room_memory.link_spawn != null && main_room_memory.link_controller != null) {
            let link_spawn = Game.getObjectById(main_room_memory.link_spawn);
            let link_controller = Game.getObjectById(main_room_memory.link_controller);
            if(link_spawn.cooldown === 0
                && link_controller.store[RESOURCE_ENERGY] <= link_controller.store.getCapacity(RESOURCE_ENERGY) - 50
                && link_spawn.store[RESOURCE_ENERGY] >= 50 ) {
                let transfer_status = link_spawn.transferEnergy(link_controller);
                switch(transfer_status) {
                    case OK:
                        break;
                    default:
                        console.log("link transfer", transfer_status)
                }
            }
            // console.log(link_spawn, link_spawn.store[RESOURCE_ENERGY], link_spawn.cooldown)
            // console.log(link_controller, link_controller.store[RESOURCE_ENERGY])
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check / Build Road
    cpu = Game.cpu.getUsed();
    let road_site_num = 0;
    if (main_room.controller.level >= 5 && site_sum === 0) {
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
                for(let mineral_id in main_room_memory.mineral) {
                    if(main_room_memory.mineral.hasOwnProperty(mineral_id)) {

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
    let energy_mine_num = 0
    main_room_memory.creep.miner.max_num = 0;
    for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
        if(["claimed", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
            main_room_memory.creep.miner.max_num += Object.keys(Memory.room_dict[room_name].source).length;
            energy_mine_num += Object.keys(Memory.room_dict[room_name].source).length;
            // if(main_room.controller.level >= 6) {
            //     main_room_memory.creep.miner.max_num += Object.keys(Memory.room_dict[room_name].mineral).length;
            // }
        }
    }
    ////    miner / mine port assignment
    for(let room_name of[main_room_name].concat(main_room_memory.sub_room_list)) {
        if(!["claimed", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
            continue;
        }
        for (let source_id in Memory.room_dict[room_name].source) {
            if (Memory.room_dict[room_name].source.hasOwnProperty(source_id)) {
                let source_info = Memory.room_dict[room_name].source[source_id];
                if (source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                    Memory.room_dict[room_name].source[source_id].assigned_miner = null;
                    for (let miner_name of main_room_memory.creep.miner.name_list) {
                        if (Memory.creeps[miner_name].target_id == null) {  // idle miner
                            Memory.creeps[miner_name].target_id = source_id;
                            Memory.creeps[miner_name].container_id = source_info.container;
                            Memory.room_dict[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        } else if (Memory.creeps[miner_name].target_id === source_id) {  // miner already assigned
                            Memory.room_dict[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        }
                    }
                }
                else {  // check miner memory
                    let miner_name = source_info.assigned_miner;
                    if (Memory.creeps[miner_name].target_id == null
                        || Memory.creeps[miner_name].target_id !== source_id) {
                        Memory.creeps[miner_name].target_id = source_id;
                    }
                    if (Memory.creeps[miner_name].container_id == null) {
                        Memory.creeps[miner_name].container_id = source_info.container;
                    }
                }
            }
        }
        if(room_name === main_room_name && main_room.controller.level >= 6) {
            for(let mineral_id in Memory.room_dict[room_name].mineral) {
                if(Memory.room_dict[room_name].mineral.hasOwnProperty(mineral_id)) {
                    let mineral_info = Memory.room_dict[room_name].mineral[mineral_id];
                    let extractor = Game.getObjectById(mineral_info.extractor);
                    let container = Game.getObjectById(mineral_info.container);
                    if(extractor != null && extractor.progress != null
                        || container != null && container.progress != null) {
                        continue;  // extractor and container are not ready
                    }
                    main_room_memory.creep.miner.max_num += 1;
                    if (mineral_info.assigned_miner == null || Game.creeps[mineral_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                        Memory.room_dict[room_name].mineral[mineral_id].assigned_miner = null;
                        for (let miner_name of main_room_memory.creep.miner.name_list) {
                            if (Memory.creeps[miner_name].target_id == null) {  // idle miner
                                Memory.creeps[miner_name].target_id = mineral_id;
                                Memory.creeps[miner_name].extractor_id = mineral_info.extractor;
                                Memory.creeps[miner_name].container_id = mineral_info.container;
                                Memory.room_dict[room_name].mineral[mineral_id].assigned_miner = miner_name;
                                break;
                            } else if (Memory.creeps[miner_name].target_id === mineral_id) {  // miner already assigned
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
    ////    adjust carrier number
    main_room_memory.creep.carrier.max_num = 0;
    for(let i in main_room_memory.container_list) {
        if(main_room_memory.container_list.hasOwnProperty(i)) {
            if(Game.getObjectById(main_room_memory.container_list[i]) != null
                && Game.getObjectById(main_room_memory.container_list[i]).progress == null) {
                main_room_memory.creep.carrier.max_num += 1;
            }
        }
    }
    if(main_room_memory.extension_list.length < main_room_memory.creep.carrier.max_num) {
        main_room_memory.creep.carrier.max_num = main_room_memory.extension_list.length;
    }
    // while(main_room_memory.creep.carrier.type_list.length > main_room_memory.creep.carrier.name_list.length) {
    //     main_room_memory.creep.carrier.type_list.pop();
    // }
    // while(main_room_memory.creep.carrier.type_list.length < main_room_memory.creep.carrier.name_list.length) {
    //     main_room_memory.creep.carrier.type_list.push("");
    // }
    // // for(let i in [...Array(main_room_memory.creep.carrier.type_list.length).keys()]) {
    // //     main_room_memory.creep.carrier.type_list[i] = "energy"
    // // }
    // if(main_room_memory.creep.carrier.type_list.includes("")) {
    //     let energy_carrier_num = main_room_memory.creep.carrier.type_list.filter(x => x === "energy").length;
    //     if(energy_carrier_num < energy_mine_num) {
    //         let _i = main_room_memory.creep.carrier.type_list.indexOf("");
    //         main_room_memory.creep.carrier.type_list[_i] = "energy";
    //     }
    //     else {
    //         if(main_room.controller.level >= 6) {
    //             for(let mineral_id in main_room_memory.mineral) {
    //                 if(main_room_memory.mineral.hasOwnProperty(mineral_id)) {
    //                     let _i = main_room_memory.creep.carrier.type_list.indexOf("");
    //                     main_room_memory.creep.carrier.type_list[_i] = main_room_memory.mineral[mineral_id].type;
    //                 }
    //             }
    //         }
    //     }
    // }
    // console.log(main_room_memory.creep.carrier.type_list)

    ////    task manager test
    Memory.task = {}
    Memory.task_id = 1;
    for(let i of main_room_memory.container_list) {
        let container = Game.getObjectById(i);
        // console.log("container", container)
        if(container.progress != null) {
            continue;
        }
        let container_task = Object.keys(Memory.task).reduce(
            function(acc, cur, idx, src){
                if(Memory.task[cur].from_id === container.id) {
                    acc[cur] = Memory.task[cur];
                }
            }, {});
        // console.log("====", container_task)
        if(container_task == null) {
            // console.log("+++++", Object.keys(Memory.task).reduce(
            //     function(acc, cur, idx, src){
            //         console.log("$$$$$$$", cur, acc)
            //         acc[cur] = Memory.task[cur];
            //         console.log("%%%%%%%%", cur, acc)
            //     }, {}))
            continue;
        }
        // console.log(container.store[RESOURCE_HYDROGEN])
        // if(Object.keys(container_task).length === 0
        //     && container.store[RESOURCE_HYDROGEN] >= container.store.getCapacity() * 0.8) {
        //     // && container.store[RESOURCE_HYDROGEN] >= main_room_memory.creep.carrier.avg_level * 100) {
        //     let task = {
        //         ...TASK_TEMPLATE
        //     };
        //     task.task_id = Memory.task_id;
        //     task.from_id = container.id;
        //
        //     task.type = "transfer";
        //     task.detail = "transfer mineral";
        //     task.description = "transfer H from container to terminal";
        //
        //     task.resource_type = RESOURCE_HYDROGEN;
        //     task.resource_amount_total = container.store[RESOURCE_HYDROGEN];
        //     task.resource_amount_current = 0;
        //
        //     task.from_id = container.id;
        //     task.from_type = STRUCTURE_CONTAINER;
        //     task.to_id = main_room.terminal.id;
        //     task.to_type = STRUCTURE_TERMINAL;
        //
        //     // Memory.task[Memory.task_id] = task;
        //     // Memory.task_id += 1;
        // }
        if(Object.keys(container_task).length === 0) {
            if(container.store[RESOURCE_ENERGY] >= container.store.getCapacity() * 0.8
                || container.store[RESOURCE_ENERGY] >= main_room_memory.creep.carrier.avg_level * 100) {
                if(main_room.energyAvailable < main_room.energyCapacityAvailable) {
                    let task = {
                        ...TASK_REFUEL_TEMPLATE
                    };
                    task.task_id = Memory.task_id;

                    task.type = "refuel";
                    task.detail = "refuel";
                    task.description = "refuel spawn and extension";

                    task.resource_type = RESOURCE_ENERGY;
                    task.resource_amount_total = main_room.energyCapacityAvailable - main_room.energyAvailable;
                    task.resource_amount_current = 0;

                    task.from_id = container.id;
                    task.from_type = STRUCTURE_CONTAINER;
                    task.to_id = null;
                    task.to_type = null;

                    Memory.task[Memory.task_id] = task;
                    Memory.task_id += 1;
                }
            }
        }
    }
    for(let i in Memory.task) {
        // console.log(i, Memory.task[i])
    }
    ////////////

    ////    adjust refueler number
    main_room_memory.creep.refueler.max_num = 0;
    if(main_room.controller.level >= 4 && main_room_memory.storage_list.length > 0) {
        main_room_memory.creep.refueler.max_num =
            // main_room_memory.storage_list.length + main_room_memory.tower_list.length;
            main_room_memory.tower_list.length;
    }
    // if(main_room_memory.creep.carrier.name_list.length === 0) {
    //     main_room_memory.creep.harvester.max_num = Object.keys(Memory.room_dict[room_name].source).length;
    // }
    // else {
    //     main_room_memory.creep.harvester.max_num = 1;
    // }
    ////    TODO: adjust builder number
    // main_room_memory.creep.builder.max_num = 1;
    ////    adjust scout number
    main_room_memory.creep.scout.max_num = 0;
    if(main_room.controller.level >= 4) {
        main_room_memory.creep.scout.max_num = 1;
    }
    ////    adjust claimer number
    main_room_memory.creep.claimer.max_num = 0;
    for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
        if(["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
            main_room_memory.creep.claimer.max_num += 1;
        }
    }
    ////    adjust upgrader number
    // main_room_memory.creep.upgrader.max_num = 0;  // reset
    if(main_room_memory.creep.upgrader.name_list.length >= main_room_memory.creep.upgrader.max_num
        && site_sum === 0
        && main_room_memory.spawn_idle_time >= 30 * main_room.controller.level) {
        main_room_memory.creep.upgrader.max_num += 1;
    }
    else if(main_room_memory.creep.upgrader.name_list.length <= main_room_memory.creep.upgrader.max_num
        && main_room_memory.spawn_busy_time >= 60 * main_room.controller.level
        && main_room_memory.creep.upgrader.max_num > 0) {
        main_room_memory.creep.upgrader.max_num -= 1;
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
        "H:" + main_room_memory.creep.harvester.name_list.length + "/"
        + main_room_memory.creep.harvester.max_num
        + "(" + main_room_memory.creep.harvester.avg_level + ")",
        "M:" + main_room_memory.creep.miner.name_list.length + "/"
        + main_room_memory.creep.miner.max_num
        + "(" + main_room_memory.creep.miner.avg_level + ")",
        "U:" + main_room_memory.creep.upgrader.name_list.length + "/"
        + main_room_memory.creep.upgrader.max_num
        + "(" + main_room_memory.creep.upgrader.avg_level + ")",
        "C:" + main_room_memory.creep.carrier.name_list.length + "/"
        + main_room_memory.creep.carrier.max_num
        + "(" + main_room_memory.creep.carrier.avg_level + ")",
        "R:" + main_room_memory.creep.refueler.name_list.length + "/"
        + main_room_memory.creep.refueler.max_num
        + "(" + main_room_memory.creep.refueler.avg_level + ")",
        "S:" + main_room_memory.creep.scout.name_list.length + "/"
        + main_room_memory.creep.scout.max_num
        + "(" + main_room_memory.creep.scout.avg_level + ")",
        "CL:" + main_room_memory.creep.claimer.name_list.length + "/"
        + main_room_memory.creep.claimer.max_num
        + "(" + main_room_memory.creep.claimer.avg_level + ")",
    );

    // if(Game.cpu.bucket >= 5000){
    //     Game.cpu.generatePixel();
    // }
};

module.exports = global_manage;
