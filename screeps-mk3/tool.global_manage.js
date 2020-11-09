
let mine_port_check = require("tool.mine_port_check");

let global_manage = function(spawn_name) {
    let spawn = Game.spawns[spawn_name];
    let spawn_room = Game.spawns[spawn_name].room;
    ///////////////////////////////////////////////////////////////////////
    ////    Check Container
    for(let i in Memory.my_spawn[spawn_name].container_list) {
        if(Game.getObjectById(Memory.my_spawn[spawn_name].container_list[i]) == null) {
            Memory.my_spawn[spawn_name].container_list.splice(i, 1);
        }
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Check Mine
    for(let room_name in Memory.my_spawn[spawn_name].room) {
        mine_port_check.run(spawn_name, room_name);
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Check Extension
    let extension_num = spawn_room.find(FIND_STRUCTURES, {
        filter: (target) => target.structureType === STRUCTURE_EXTENSION
    }).length;
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
        extension_site_num = spawn_room.find(FIND_CONSTRUCTION_SITES, {
            filter: (target) => target.structureType === STRUCTURE_EXTENSION
        }).length;
        if(extension_site_num === 0) {
            let extension_table = {
                "1": [-1, 1], "2": [1, 1], "3": [-2, 2], "4": [0, 2], "5": [2, 2],
                "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3], "10": [-4, 4],
                "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4], "15": [-3, 5],
                "16": [-1, 5], "17": [1, 5], "18": [3, 5], "19": [-4, 6], "20": [-2, 6],
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
    ///////////////////////////////////////////////////////////////////////
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
        let storage_list = spawn_room.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType === STRUCTURE_STORAGE
        });
        for (let i in storage_list) {  // check game status
            if(storage_list.hasOwnProperty(i)) {
                if (!Memory.my_spawn[spawn_name].storage_list.includes(storage_list[i].id)) {
                    Memory.my_spawn[spawn_name].storage_list.push(storage_list[i].id);
                }
            }
        }
        storage_num = storage_list.length;
        if (storage_num < storage_max && extension_site_num === 0) {
            storage_site_num = spawn_room.find(FIND_CONSTRUCTION_SITES, {
                filter: (target) => target.structureType === STRUCTURE_STORAGE
            }).length;
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
    ///////////////////////////////////////////////////////////////////////
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
        let tower_list = spawn_room.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType === STRUCTURE_TOWER
        });
        for (let i in tower_list) {  // check game status
            if(tower_list.hasOwnProperty(i)) {
                if (!Memory.my_spawn[spawn_name].storage_list.includes(tower_list[i].id)) {
                    Memory.my_spawn[spawn_name].storage_list.push(tower_list[i].id);
                }
            }
        }
        tower_num = tower_list.length;
        if (tower_num < tower_max && extension_site_num + storage_site_num === 0) {
            tower_site_num = spawn_room.find(FIND_CONSTRUCTION_SITES, {
                filter: (target) => target.structureType === STRUCTURE_TOWER
            }).length;
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
    ///////////////////////////////////////////////////////////////////////
    ////    Adjust Worker Number
    Memory.my_spawn[spawn_name].creep.miner.max_num = 0;
    let room = Game.spawns[spawn_name].room;
    let room_name = room.name;
    // adjust miner number
    Memory.my_spawn[spawn_name].creep.miner.max_num += Object.keys(Memory.my_spawn[spawn_name].room[room_name].source).length;
    if(room.controller.level >= 6) {
        Memory.my_spawn[spawn_name].creep.miner.max_num += Object.keys(Memory.my_spawn[spawn_name].room[room_name].mineral).length;
    }
    // miner / mine port assignment
    for(let source_id in Memory.my_spawn[spawn_name].room[room_name].source) {
        if(Memory.my_spawn[spawn_name].room[room_name].source.hasOwnProperty(source_id)) {
            let source_info = Memory.my_spawn[spawn_name].room[room_name].source[source_id];
            if(source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {  // if no assigned miner, or miner doesn't exist
                Memory.my_spawn[spawn_name].room[room_name].source[source_id].assigned_miner = null;
                for(let i in Memory.my_spawn[spawn_name].creep.miner.name_list) {
                    if(Memory.my_spawn[spawn_name].creep.miner.name_list.hasOwnProperty(i)) {
                        let miner_name = Memory.my_spawn[spawn_name].creep.miner.name_list[i];
                        if(Memory.creeps[miner_name].target_id == null) {  // idle miner
                            Memory.creeps[miner_name].target_id = source_id;
                            Memory.creeps[miner_name].container_id = source_info.container;
                            Memory.my_spawn[spawn_name].room[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        }
                        else if(Memory.creeps[miner_name].target_id === source_id) {  // miner already assigned
                            Memory.my_spawn[spawn_name].room[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        }
                    }
                }
            }
            else {  // check miner memory
                let miner_name = source_info.assigned_miner;
                if(Memory.creeps[miner_name].target_id == null) {
                    Memory.creeps[miner_name].target_id = source_id;
                }
                if(Memory.creeps[miner_name].container_id == null) {
                    Memory.creeps[miner_name].container_id = source_info.container;
                }
            }
        }
    }
    // adjust carrier number
    Memory.my_spawn[spawn_name].creep.carrier.max_num = Memory.my_spawn[spawn_name].container_list.length;
    // adjust refueler number
    // Memory.my_spawn[spawn_name].creep.refueler.max_num = 0;
    // if(Memory.my_spawn[spawn_name].storage_list.length > 0) {
    //     Memory.my_spawn[spawn_name].creep.refueler.max_num = Memory.my_spawn[spawn_name].room[room_name].tower_list.length;
    // }
    // adjust harvester number
    Memory.my_spawn[spawn_name].creep.harvester.max_num = 2;
    // if(Memory.my_spawn[spawn_name].creep.carrier.name_list.length === 0) {
    //     Memory.my_spawn[spawn_name].creep.harvester.max_num = Object.keys(Memory.my_spawn[spawn_name].room[room_name].source).length;
    // }
    // else {
    //     Memory.my_spawn[spawn_name].creep.harvester.max_num = 1;
    // }
    // TODO: adjust builder number
    // Memory.my_spawn[spawn_name].creep.builder.max_num = 1;
    // adjust upgrader number
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
        // upgrader num already at maxinum number
        if(room.energyAvailable === 300 + extension_num * extension_capacity
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num <= room.controller.level * 3
            && Memory.cpu_stat["600_tick_avg"] < 5
            && Memory.my_spawn[spawn_name].energy_stat["600_tick_sum_trend"] > 50) {
            // spawn is idle, cpu < 5 in 10 min, energy increasing in 10 min
            Memory.my_spawn[spawn_name].creep.upgrader.max_num += 1;
        }
        else if(room.energyAvailable === 300 + extension_num * extension_capacity
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num <= room.controller.level
            && Memory.cpu_stat["3600_tick_avg"] < 15
            && (Memory.my_spawn[spawn_name].energy_stat["3600_tick_sum_trend"] > 50
                || room.energyAvailable > 800000)) {
            // spawn is idle, cpu < 15 in 1 hour, energy increasing in 1 hour
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
    console.log("Upgrader: " + Memory.my_spawn[spawn_name].creep.upgrader.name_list.length + "/" + Memory.my_spawn[spawn_name].creep.upgrader.max_num)
};

module.exports = global_manage;
