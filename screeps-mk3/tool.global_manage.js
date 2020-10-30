
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
    let extension_site_num = spawn_room.find(FIND_CONSTRUCTION_SITES, {
        filter: (target) => target.structureType === STRUCTURE_EXTENSION
    }).length;
    let extension_capacity = 50;
    if(extension_site_num === 0) {
        let extension_max = 0;
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
        let extension_table = {
            "1": [-1, 1], "2": [1, 1], "3": [-2, 2], "4": [0, 2], "5": [2, 2],
            "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3], "10": [-4, 4],
            "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4], "15": [-5, 5],
            "16": [-3, 5], "17": [-1, 5], "18": [1, 5], "19": [3, 5], "20": [5, 5],
        };
        let i = 1;
        while(extension_site_num === 0 && extension_num < extension_max && i <= Object.keys(extension_table).length) {
            let new_pos = new RoomPosition(spawn.pos.x + extension_table[i][0],
                spawn.pos.y + extension_table[i][1],
                spawn_room.name);
            let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
            switch(create_status) {
                case OK:
                    extension_site_num += 1;
                    break;
                default:
                    console.log("create extension failed:", create_status)
            }
            i += 1;
        }
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Check Tower
    if (spawn_room.controller.level >= 3) {
        let tower_num = spawn_room.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType === STRUCTURE_TOWER
        }).length;
        let tower_site_num = spawn_room.find(FIND_CONSTRUCTION_SITES, {
            filter: (target) => target.structureType === STRUCTURE_TOWER
        }).length;
        let tower_max = 0;
        switch(spawn_room.controller.level) {
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
        let tower_table = {
            "1": [-2, 0],
            "2": [2, 0],
        };
        let i = 1;
        while(tower_site_num === 0 && tower_num < tower_max && i <= Object.keys(tower_table).length) {
            let new_pos = new RoomPosition(spawn.pos.x + tower_table[i][0],
                spawn.pos.y + tower_table[i][1],
                spawn_room.name);
            let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_TOWER);
            switch(create_status) {
                case OK:
                    tower_site_num += 1;
                    break;
                default:
                    console.log("create tower failed:", create_status)
            }
            i += 1;
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
    Memory.my_spawn[spawn_name].creep.carrier.max_num = 0;
    Memory.my_spawn[spawn_name].creep.carrier.max_num += Memory.my_spawn[spawn_name].creep.miner.name_list.length;
    // adjust refueler number
    Memory.my_spawn[spawn_name].creep.refueler.max_num = 0;
    if(Memory.my_spawn[spawn_name].storage_list.length > 0) {
        Memory.my_spawn[spawn_name].creep.refueler.max_num = Memory.my_spawn[spawn_name].room[room_name].tower_list.length;
    }
    // adjust harvester number
    if(Memory.my_spawn[spawn_name].creep.carrier.name_list.length === 0) {
        Memory.my_spawn[spawn_name].creep.harvester.max_num = Object.keys(Memory.my_spawn[spawn_name].room[room_name].source).length;
    }
    else {
        Memory.my_spawn[spawn_name].creep.harvester.max_num = 0;
    }
    // TODO: adjust builder number
    // Memory.my_spawn[spawn_name].creep.builder.max_num = 1;
    // adjust upgrader number
    if(Memory.my_spawn[spawn_name].creep.upgrader.name_list.length < Memory.my_spawn[spawn_name].creep.upgrader.max_num
        && Memory.my_spawn[spawn_name].energy_stat["3600_tick_sum_trend"] < 0) {
        Memory.my_spawn[spawn_name].creep.upgrader.max_num= Math.floor(parseInt(Memory.my_spawn[spawn_name].creep.upgrader.max_num) / 2);
        if(Memory.my_spawn[spawn_name].creep.upgrader.max_num === 0) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num = 1;
        }
    }
    else if(Memory.my_spawn[spawn_name].creep.upgrader.name_list.length === Memory.my_spawn[spawn_name].creep.upgrader.max_num
        && Memory.my_spawn[spawn_name].spawn_cool_down === 0) {
        if(Memory.my_spawn[spawn_name].creep.upgrader.max_num === 0) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num = 1;
        }
        if(room.energyAvailable === extension_num * extension_capacity + 300
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num <= room.controller.level * 3
            && Memory.cpu_stat["600_tick_avg"] < 5
            && Memory.my_spawn[spawn_name].energy_stat["600_tick_sum_trend"] > 50) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num += 1;
        }
        else if(Memory.my_spawn[spawn_name].creep.upgrader.max_num < room.controller.level
            && Memory.cpu_stat["3600_tick_avg"] < 15
            && (Memory.my_spawn[spawn_name].energy_stat["3600_tick_sum_trend"] > 50
                || room.energyAvailable > 800000)) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num += 1;
        }
        else if(Memory.cpu_stat["3600_tick_avg"] > 15
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num > 1) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num -= 1;
        }
        else if(Memory.cpu_stat["3600_tick_sum_trend"] < 50
            && Memory.my_spawn[spawn_name].creep.upgrader.max_num > 1) {
            Memory.my_spawn[spawn_name].creep.upgrader.max_num -= 1;
        }
    }
    console.log("Upgrader: " + Memory.my_spawn[spawn_name].creep.upgrader.name_list.length + "/" + Memory.my_spawn[spawn_name].creep.upgrader.max_num)
};

module.exports = global_manage;
