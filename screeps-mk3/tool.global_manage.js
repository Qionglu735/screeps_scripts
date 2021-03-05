
let mine_port_check = require("tool.mine_port_check");

let global_manage = function(spawn_name) {
    let spawn = Game.spawns[spawn_name];
    let spawn_room = Game.spawns[spawn_name].room;
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Container
    for(let i in Memory.my_spawn[spawn_name].container_list) {
        if(Memory.my_spawn[spawn_name].container_list.hasOwnProperty(i)) {
            if(Game.getObjectById(Memory.my_spawn[spawn_name].container_list[i]) == null) {
                Memory.my_spawn[spawn_name].container_list.splice(i, 1);
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Mine
    for(let room_name in Memory.my_room) {
        mine_port_check.run(spawn_name, room_name);
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Extension
    for(let i in Memory.my_spawn[spawn_name].extension_list) {  // check memory status
        if(Memory.my_spawn[spawn_name].extension_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(Memory.my_spawn[spawn_name].extension_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_EXTENSION)) {
                Memory.my_spawn[spawn_name].extension_list.splice(i, 1);
            }
        }
    }
    let extension_num = Memory.my_spawn[spawn_name].extension_list.length;
    let extension_site_num = 0;
    let extension_max = 0;
    let extension_capacity = 50;
    switch(spawn_room.controller.level) {
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
    if (extension_num < extension_max) {
        extension_site_num = spawn_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_EXTENSION
        }).length;
        if(extension_site_num === 0) {  // not constructing
            if(extension_num < extension_max) {  // num < max
                let extension_list = spawn_room.find(FIND_MY_STRUCTURES, {  // check game status
                    filter: (target) => target.structureType === STRUCTURE_EXTENSION
                });
                for (let i in extension_list) {  // update to memory
                    if(extension_list.hasOwnProperty(i)) {
                        if (!Memory.my_spawn[spawn_name].extension_list.includes(extension_list[i].id)) {
                            Memory.my_spawn[spawn_name].extension_list.push(extension_list[i].id);
                        }
                    }
                }
                extension_num = Memory.my_spawn[spawn_name].extension_list.length;
                if(extension_num < extension_max) {
                    let extension_table = {
                        "1": [-1, 1], "2": [1, 1],
                        "3": [-2, 2], "4": [0, 2], "5": [2, 2],
                        "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3],
                        "10": [-4, 4], "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4],
                        "15": [-3, 5], "16": [-1, 5], "17": [1, 5], "18": [3, 5],
                        "19": [-4, 6], "20": [-2, 6], "21": [0, 6], "22": [2, 6], "23": [4, 6],
                        "24": [-3, 7], "25": [-1, 7], "26": [1, 7], "27": [3, 7],
                        "28": [-4, 8], "29": [-2, 8], "30": [0, 8], "31": [2, 8], "32": [4, 8],
                    };
                    let new_pos = new RoomPosition(spawn.pos.x + extension_table[extension_num + 1][0],
                        spawn.pos.y + extension_table[extension_num + 1][1],
                        spawn_room.name);
                    let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
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
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Storage
    for(let i in Memory.my_spawn[spawn_name].storage_list) {  // check memory status
        if(Memory.my_spawn[spawn_name].storage_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(Memory.my_spawn[spawn_name].storage_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_STORAGE)) {
                Memory.my_spawn[spawn_name].storage_list.splice(i, 1);
            }
        }
    }
    let storage_num = Memory.my_spawn[spawn_name].storage_list.length;
    let storage_site_num = 0;
    let storage_max = 0;
    if(spawn_room.controller.level >= 4) {
        storage_max = 1;
    }
    if (storage_num < storage_max) {
        storage_site_num = spawn_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_STORAGE
        }).length;
        if(storage_site_num === 0) {  // not constructing
            if(storage_num < storage_max) {  // num < max
                let storage_list = spawn_room.find(FIND_MY_STRUCTURES, {  // check game status
                    filter: (target) => target.structureType === STRUCTURE_STORAGE
                });
                for(let i in storage_list) {  // update to memory
                    if(storage_list.hasOwnProperty(i)) {
                        if (!Memory.my_spawn[spawn_name].storage_list.includes(storage_list[i].id)) {
                            Memory.my_spawn[spawn_name].storage_list.push(storage_list[i].id);
                        }
                    }
                }
                storage_num = Memory.my_spawn[spawn_name].storage_list.length;
                if (storage_num < storage_max && extension_site_num === 0) {

                    let storage_pos = [0, -2];
                    if (storage_site_num === 0) {
                        let new_pos = new RoomPosition(spawn.pos.x + storage_pos[0],
                            spawn.pos.y + storage_pos[1],
                            spawn_room.name);
                        let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_STORAGE);
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
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Tower
    for(let i in Memory.my_spawn[spawn_name].tower_list) {  // check memory status
        if(Memory.my_spawn[spawn_name].tower_list.hasOwnProperty(i)) {
            let obj = Game.getObjectById(Memory.my_spawn[spawn_name].tower_list[i]);
            if (!(obj && obj.structureType && obj.structureType === STRUCTURE_TOWER)) {
                Memory.my_spawn[spawn_name].tower_list.splice(i, 1);
            }
        }
    }
    let tower_num = Memory.my_spawn[spawn_name].tower_list.length;
    let tower_site_num = 0;
    let tower_max = 0;
    switch (spawn_room.controller.level) {
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
    if (tower_num < tower_max) {
        tower_site_num = spawn_room.find(FIND_MY_CONSTRUCTION_SITES, {  // find construction_site
            filter: (target) => target.structureType === STRUCTURE_TOWER
        }).length;
        if(tower_site_num === 0) {  // not constructing
            if(tower_num < tower_max) {  // num < max
                let tower_list = spawn_room.find(FIND_MY_STRUCTURES, {  // check game status
                    filter: (target) => target.structureType === STRUCTURE_TOWER
                });
                for(let i in tower_list) {  // update to memory
                    if(tower_list.hasOwnProperty(i)) {
                        if (!Memory.my_spawn[spawn_name].tower_list.includes(tower_list[i].id)) {
                            Memory.my_spawn[spawn_name].tower_list.push(tower_list[i].id);
                        }
                    }
                }
                tower_num = Memory.my_spawn[spawn_name].tower_list.length;
                if (tower_num < tower_max && extension_site_num + storage_site_num === 0) {
                    if (tower_site_num === 0) {
                        let tower_table = {
                            "1": [-2, 0],
                            "2": [2, 0],
                        };
                        let new_pos = new RoomPosition(spawn.pos.x + tower_table[tower_num + 1][0],
                            spawn.pos.y + tower_table[tower_num + 1][1],
                            spawn_room.name);
                        let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_TOWER);
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
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Room
    for(let room_name in Memory.my_room) {
        if(spawn_room.controller.level >= 4 && Memory.my_room[room_name].room_distance === 1) {
            if(Memory.my_room[room_name].claim_status === "neutral") {
                Memory.my_room[room_name].claim_status = "to_reverse";
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Adjust Worker Number
    Memory.my_spawn[spawn_name].creep.miner.max_num = 0;
    ////    adjust miner number
    for(let room_name in Memory.my_room) {
        if(["claimed", "reversing", "to_reverse"].includes(Memory.my_room[room_name].claim_status)) {
            Memory.my_spawn[spawn_name].creep.miner.max_num += Object.keys(Memory.my_room[room_name].source).length;
            if(spawn_room.controller.level >= 6) {
                Memory.my_spawn[spawn_name].creep.miner.max_num += Object.keys(Memory.my_room[room_name].mineral).length;
            }
        }
    }
    ////    miner / mine port assignment
    for(let room_name in Memory.my_room) {
        for (let source_id in Memory.my_room[room_name].source) {
            if (Memory.my_room[room_name].source.hasOwnProperty(source_id)) {
                let source_info = Memory.my_room[room_name].source[source_id];
                if (source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                    Memory.my_room[room_name].source[source_id].assigned_miner = null;
                    for (let i in Memory.my_spawn[spawn_name].creep.miner.name_list) {
                        if (Memory.my_spawn[spawn_name].creep.miner.name_list.hasOwnProperty(i)) {
                            let miner_name = Memory.my_spawn[spawn_name].creep.miner.name_list[i];
                            if (Memory.creeps[miner_name].target_id == null) {  // idle miner
                                Memory.creeps[miner_name].target_id = source_id;
                                Memory.creeps[miner_name].container_id = source_info.container;
                                Memory.my_room[room_name].source[source_id].assigned_miner = miner_name;
                                break;
                            } else if (Memory.creeps[miner_name].target_id === source_id) {  // miner already assigned
                                Memory.my_room[room_name].source[source_id].assigned_miner = miner_name;
                                break;
                            }
                        }
                    }
                } else {  // check miner memory
                    let miner_name = source_info.assigned_miner;
                    if (Memory.creeps[miner_name].target_id == null) {
                        Memory.creeps[miner_name].target_id = source_id;
                    }
                    if (Memory.creeps[miner_name].container_id == null) {
                        Memory.creeps[miner_name].container_id = source_info.container;
                    }
                }
            }
        }
    }
    ////    adjust carrier number
    Memory.my_spawn[spawn_name].creep.carrier.max_num = Memory.my_spawn[spawn_name].container_list.length;
    ////    adjust refueler number
    Memory.my_spawn[spawn_name].creep.refueler.max_num = 0;
    if(Memory.my_spawn[spawn_name].storage_list.length > 0) {
        Memory.my_spawn[spawn_name].creep.refueler.max_num =
            Memory.my_spawn[spawn_name].storage_list.length + Memory.my_spawn[spawn_name].tower_list.length;
    }
    ////    adjust harvester number
    Memory.my_spawn[spawn_name].creep.harvester.max_num = 2;
    // if(Memory.my_spawn[spawn_name].creep.carrier.name_list.length === 0) {
    //     Memory.my_spawn[spawn_name].creep.harvester.max_num = Object.keys(Memory.my_room[room_name].source).length;
    // }
    // else {
    //     Memory.my_spawn[spawn_name].creep.harvester.max_num = 1;
    // }
    ////    TODO: adjust builder number
    // Memory.my_spawn[spawn_name].creep.builder.max_num = 1;
    ////    adjust claimer number
    Memory.my_spawn[spawn_name].creep.claimer.max_num = 0;
    for(let room_name in Memory.my_room) {
        if(["to_reverse", "reversing"].includes(Memory.my_room[room_name].claim_status)) {
            Memory.my_spawn[spawn_name].creep.claimer.max_num += 1;
        }
    }
    ////    adjust upgrader number
    if(spawn_room.controller.level >= 4) {
        Memory.my_spawn[spawn_name].creep.scout.max_num = 1;
    }
    if(Memory.my_spawn[spawn_name].creep.upgrader.name_list.length < Memory.my_spawn[spawn_name].creep.upgrader.max_num
        && Memory.my_spawn[spawn_name].energy_stat["3600_tick_sum_trend"] < 50) {
        // energy decreasing in 1 hour: half upgrader number
        Memory.my_spawn[spawn_name].creep.upgrader.max_num = Math.floor(parseInt(Memory.my_spawn[spawn_name].creep.upgrader.max_num) / 2);
        if(Memory.my_spawn[spawn_name].creep.upgrader.max_num === 0) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num = 1;
        }
    }
    else if(Memory.my_spawn[spawn_name].creep.upgrader.name_list.length === Memory.my_spawn[spawn_name].creep.upgrader.max_num
        && Memory.my_spawn[spawn_name].spawn_cool_down === 0) {
        // upgrader num already at maximum number, spawn is idle
        if(spawn_room.energyAvailable === 300 + extension_num * extension_capacity
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num <= spawn_room.controller.level * 3
            && Memory.cpu_stat["600_tick_avg"] < 5
            && Memory.my_spawn[spawn_name].energy_stat["600_tick_sum_trend"] > 50) {
            // spawn energy at maximum, cpu < 5 in 10 min, energy increasing in 10 min
            Memory.my_spawn[spawn_name].creep.upgrader.max_num += 1;
        }
        else if(spawn_room.energyAvailable === 300 + extension_num * extension_capacity
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num <= spawn_room.controller.level
            && Memory.cpu_stat["3600_tick_avg"] < 15
            && (Memory.my_spawn[spawn_name].energy_stat["3600_tick_sum_trend"] > 50
                || spawn_room.energyAvailable > 800000)) {
            // spawn energy at maximum, cpu < 15 in 1 hour, energy increasing in 1 hour
            Memory.my_spawn[spawn_name].creep.upgrader.max_num += 1;
        }
        else if(Memory.cpu_stat["3600_tick_avg"] > 15
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num > 1) {
            // cpu > 15 in 1 hour
            Memory.my_spawn[spawn_name].creep.upgrader.max_num -= 1;
        }
        else if(Memory.cpu_stat["3600_tick_sum_trend"] < 50
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num > 1) {
            // energy decreasing in 1 hour
            Memory.my_spawn[spawn_name].creep.upgrader.max_num -= 1;
        }
    }
    console.log(
        "M:" + Memory.my_spawn[spawn_name].creep.miner.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.miner.max_num,
        "H:" + Memory.my_spawn[spawn_name].creep.harvester.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.harvester.max_num,
        "U:" + Memory.my_spawn[spawn_name].creep.upgrader.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.upgrader.max_num,
        "C:" + Memory.my_spawn[spawn_name].creep.carrier.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.carrier.max_num,
        "R:" + Memory.my_spawn[spawn_name].creep.refueler.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.refueler.max_num,
        "S:" + Memory.my_spawn[spawn_name].creep.scout.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.scout.max_num,
        "CL:" + Memory.my_spawn[spawn_name].creep.claimer.name_list.length + "/"
        + Memory.my_spawn[spawn_name].creep.claimer.max_num,
    );

    // if(Game.cpu.bucket >= 5000){
    //     Game.cpu.generatePixel();
    // }
};

module.exports = global_manage;
