
var mine_port_check = require("tool.mine_port_check");

var global_manage = function(spawn_name) {
    var spawn = Game.spawns[spawn_name];
    var spawn_room = Game.spawns[spawn_name].room;
    ///////////////////////////////////////////////////////////////////////
    ////    Check Container
    for(var i in Memory.my_spawn[spawn_name].container_list) {
        if(Game.getObjectById(Memory.my_spawn[spawn_name].container_list[i]) == null) {
            Memory.my_spawn[spawn_name].container_list.splice(i, 1);
        }
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Check Mine
    for(var room_name in Memory.my_spawn[spawn_name].room) {
        mine_port_check.run(spawn_name, room_name);
    }
    ///////////////////////////////////////////////////////////////////////
    ////    Check Extension
    var extension_num = room.find(FIND_STRUCTURES, {
        filter: (target) => target.structureType == STRUCTURE_EXTENSION
    }).length;
    var extension_site_num = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (target) => target.structureType == STRUCTURE_EXTENSION
    }).length;
    if(extension_site_num == 0) {
        var extension_max = 0;
        switch(room.controller.level) {
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
        var extension_table = {
            "1": [-1, 1], "2": [1, 1], "3": [-2, 2], "4": [0, 2], "5": [2, 2],
            "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3], "10": [-4, 4],
            "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4], "15": [-5, 5],
            "16": [-3, 5], "17": [-1, 5], "18": [1, 5], "19": [3, 5], "20": [5, 5],
        };
        var spawn = Game.spawns[spawn_name];
        var i = 1;
        while(extension_site_num == 0 && extension_num < extension_max && i <= 20) {
            var new_pos = new RoomPosition(spawn.pos.x + extension_table[i][0],
                                           spawn.pos.y + extension_table[i][1],
                                           room.name);
            var create_status = room.createConstructionSite(new_pos, STRUCTURE_EXTENSION);
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
    Memory.CreepStat.Miner.max_num = 0;
    Memory.CreepStat.Carrier.max_num = 0;
    Memory.CreepStat.Refueler.max_num = 0;
    for(var room_name in Memory.Room) {
        var room = Game.rooms[room_name];
        Memory.CreepStat.Miner.max_num += Object.keys(Memory.Room[room_name].source).length;
        if(room.controller.level >= 6) {
            Memory.CreepStat.Miner.max_num += Object.keys(Memory.Room[room_name].mineral).length;
        }
        Memory.CreepStat.Carrier.max_num += Memory.CreepStat.Miner.name_list.length;
        if(Memory.Room[room_name].storage_list.length > 0) {
            Memory.CreepStat.Refueler.max_num = Memory.Room[room_name].tower_list.length;
        }
        for(var source_id in Memory.Room[room_name].source) {
            var source_info = Memory.Room[room_name].source[source_id];
            if(source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {
                Memory.Room[room_name].source[source_id].assigned_miner == null;
                for(var i in Memory.CreepStat.Miner.name_list) {
                    var miner_name = Memory.CreepStat.Miner.name_list[i];
                    if(Memory.creeps[miner_name].target_id == null) {
                        Memory.creeps[miner_name].target_id = source_id;
                        Memory.creeps[miner_name].container_id = source_info.container;
                        Memory.Room[room_name].source[source_id].assigned_miner = miner_name;
                        break;
                    }
                    else if(Memory.creeps[miner_name].target_id == source_id) {
                        Memory.Room[room_name].source[source_id].assigned_miner = miner_name;
                        break;
                    }
                }
            }
        }
    }
    // TODO: check energy cap
    var first_room_name = Game.spawns["Spawn1"].room.name;
    var first_room = Game.rooms[room_name];
    if(Memory.CreepStat.Carrier.name_list.length == 0) {
        Memory.CreepStat.Harvester.max_num = Object.keys(Memory.Room[first_room_name].source).length;
    }
    else {
        Memory.CreepStat.Harvester.max_num = 0;
    }
//    Memory.CreepStat.Builder.max_num = 1;
    if(Memory.CreepStat.Upgrader.name_list.length < Memory.CreepStat.Upgrader.max_num
            && Memory.Room[first_room_name].energy_stat["1000_tick_sum_trend"] < 0) {
        Memory.CreepStat.Upgrader.max_num = parseInt(Memory.CreepStat.Upgrader.max_num / 2);
        if(Memory.CreepStat.Upgrader.max_num == 0) {
            Memory.CreepStat.Upgrader.max_num = 1;
        }
    }
    else if(Memory.CreepStat.Upgrader.name_list.length == Memory.CreepStat.Upgrader.max_num
            && Memory.Spawn["Spawn1"].spawn_cool_down == 0) {
        if(Memory.CreepStat.Upgrader.max_num == 0) {
            Memory.CreepStat.Upgrader.max_num = 1;
        }
        if(Memory.Cpu_Stat["10000_tick_avg"] < 15
                && (Memory.Room[first_room_name].energy_stat["1000_tick_sum_trend"] > 50
                    || first_room.energyAvailable > 800000)
                && Memory.CreepStat.Upgrader.max_num < first_room.controller.level) {
            Memory.CreepStat.Upgrader.max_num += 1;
        }
        else if(Memory.Cpu_Stat["10000_tick_avg"] > 15 && Memory.CreepStat.Upgrader.max_num > 1) {
            Memory.CreepStat.Upgrader.max_num -= 1;
        }
    }
};

module.exports = global_manage;
