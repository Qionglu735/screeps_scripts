
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
                break;
            case 8:
                extension_max = 60;
                break;
        }
        let extension_table = {
            "1": [-1, 1], "2": [1, 1], "3": [-2, 2], "4": [0, 2], "5": [2, 2],
            "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3], "10": [-4, 4],
            "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4], "15": [-5, 5],
            "16": [-3, 5], "17": [-1, 5], "18": [1, 5], "19": [3, 5], "20": [5, 5],
        };
        let spawn = Game.spawns[spawn_name];
        let i = 1;
        while(extension_site_num === 0 && extension_num < extension_max && i <= 20) {
            let new_pos = new RoomPosition(spawn.pos.x + extension_table[i][0],
                spawn.pos.y + extension_table[i][1],
                spawn_room.name);
            let create_status = spawn_room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
            switch(create_status) {
                case OK:
                    extension_site += 1;
                    break;
                default:
                    console.log("create extension failed:", create_status)
            }
            i += 1;
        }
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Adjust Worker Number
    Memory.my_spawn["Spawn1"].creep.miner.max_num = 0;
    Memory.my_spawn["Spawn1"].creep.carrier.max_num = 0;
    Memory.my_spawn["Spawn1"].creep.refueler.max_num = 0;
    for(let room_name in Memory.my_spawn["Spawn1"].room) {
        let room = Game.rooms[room_name];
        Memory.my_spawn["Spawn1"].creep.miner.max_num += Object.keys(Memory.my_spawn["Spawn1"].room[room_name].source).length;
        if(room.controller.level >= 6) {
            Memory.my_spawn["Spawn1"].creep.miner.max_num += Object.keys(Memory.my_spawn["Spawn1"].room[room_name].mineral).length;
        }
        Memory.my_spawn["Spawn1"].creep.carrier.max_num += Memory.my_spawn["Spawn1"].creep.miner.name_list.length;
        if(Memory.my_spawn["Spawn1"].storage_list.length > 0) {
            Memory.my_spawn["Spawn1"].creep.refueler.max_num = Memory.my_spawn["Spawn1"].room[room_name].tower_list.length;
        }
        for(let source_id in Memory.my_spawn["Spawn1"].room[room_name].source) {
            let source_info = Memory.my_spawn["Spawn1"].room[room_name].source[source_id];
            if(source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {
                Memory.my_spawn["Spawn1"].room[room_name].source[source_id].assigned_miner == null;
                for(let i in Memory.my_spawn["Spawn1"].creep.miner.name_list) {
                    let miner_name = Memory.my_spawn["Spawn1"].creep.miner.name_list[i];
                    if(Memory.creeps[miner_name].target_id == null) {
                        Memory.creeps[miner_name].target_id = source_id;
                        Memory.creeps[miner_name].container_id = source_info.container;
                        Memory.my_spawn["Spawn1"].room[room_name].source[source_id].assigned_miner = miner_name;
                        break;
                    }
                    else if(Memory.creeps[miner_name].target_id === source_id) {
                        Memory.my_spawn["Spawn1"].room[room_name].source[source_id].assigned_miner = miner_name;
                        break;
                    }
                }
            }
        }
    }
    // TODO: check energy cap
    let first_room_name = Game.spawns["Spawn1"].room.name;
    let first_room = Game.rooms[first_room_name];
    if(Memory.my_spawn["Spawn1"].creep.carrier.name_list.length === 0) {
        Memory.my_spawn["Spawn1"].creep.harvester.max_num = Object.keys(Memory.my_spawn["Spawn1"].room[first_room_name].source).length;
    }
    else {
        Memory.my_spawn["Spawn1"].creep.harvester.max_num = 0;
    }
//    Memory.my_spawn["Spawn1"].creep.builder.max_num = 1;
    if(Memory.my_spawn["Spawn1"].creep.upgrader.name_list.length < Memory.my_spawn["Spawn1"].creep.upgrader.max_num
        && Memory.my_spawn["Spawn1"].energy_stat["3600_tick_sum_trend"] < 0) {
        Memory.my_spawn["Spawn1"].creep.upgrader.max_num= parseInt(Memory.my_spawn["Spawn1"].creep.upgrader.max_num / 2);
        if(Memory.my_spawn["Spawn1"].creep.upgrader.max_num === 0) {
            Memory.my_spawn["Spawn1"].creep.upgrader.max_num = 1;
        }
    }
    else if(Memory.my_spawn["Spawn1"].creep.upgrader.name_list.length === Memory.my_spawn["Spawn1"].creep.upgrader.max_num
        && Memory.my_spawn["Spawn1"].spawn_cool_down === 0) {
        if(Memory.my_spawn["Spawn1"].creep.upgrader.max_num === 0) {
            Memory.my_spawn["Spawn1"].creep.upgrader.max_num = 1;
        }
        if(Memory.cpu_stat["3600_tick_avg"] < 15
            && (Memory.my_spawn["Spawn1"].energy_stat["3600_tick_sum_trend"] > 50
                || first_room.energyAvailable > 800000)
            && Memory.my_spawn["Spawn1"].creep.upgrader.max_num < first_room.controller.level) {
            Memory.my_spawn["Spawn1"].creep.upgrader.max_num += 1;
        }
        else if(Memory.cpu_stat["3600_tick_avg"] > 15 && Memory.my_spawn["Spawn1"].creep.upgrader.max_num > 1) {
            Memory.my_spawn["Spawn1"].creep.upgrader.max_num -= 1;
        }
    }
};

module.exports = global_manage;
