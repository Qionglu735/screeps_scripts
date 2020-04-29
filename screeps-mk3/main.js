
// https://docs.screeps.com/api/#Game

var structureSpawn = require("structure.spawn");

var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");

var mine_port_check = require("tool.mine_port_check");

var stat = require("tool.stat");

module.exports.loop = function() {

    ////    Loop Control
    ////    Memory.LoopControl: -1 == normal, 0 == pause, N(N>0) == N step
    ////    Use console to set value: Memory.LoopControl = 0
    if(Memory.LoopControl == null) {
        Memory.LoopControl = 0;
    }
    if(Memory.LoopControl == 0) {
        return;
    }
    if(Memory.LoopControl > 0) {
        Memory.LoopControl -= 1;
    }

    ////    Memory Control
    ////    Memory.MemoryControl: 0 == normal, 1 == reset
    ////    Use console to set value: Memory.MemoryControl = 1
    if(Memory.MemoryControl == null) {
        Memory.MemoryControl = 1;
    }
    if(Memory.MemoryControl == 1 && Game.spawns["Spawn1"]) {
        Memory.MemoryControl = 0;
        //// init memory
        Memory.Spawn = {
            "Spawn1": {
                "creep_spawn_list": [],
                "spawn_cool_down": 0,
            }
        };
        Memory.Room = {};
        Memory.Room[Game.spawns["Spawn1"].room.name] = {
            "source": {},
            "mineral": {},
            "claim_status": "claimed",
            "container_list": [],
            "storage_list": [],
            "tower_list": [],
            "energy_stat": {
                "energy_track": [],
                "10_tick_sum_a": 0, "10_tick_sum_b": 0, "10_tick_sum_trend": 0,
                "100_tick_sum_a": 0, "100_tick_sum_b": 0, "100_tick_sum_trend": 0,
                "500_tick_sum_a": 0, "500_tick_sum_b": 0, "500_tick_sum_trend": 0,
                "1000_tick_sum_a": 0, "1000_tick_sum_b": 0, "1000_tick_sum_trend": 0,
                "10000_tick_sum_a": 0, "10000_tick_sum_b": 0, "10000_tick_sum_trend": 0,
            },
            "cpu_stat": {
                "cpu_track": [],
                "10000_tick_sum": 0,
                "10000_tick_avg": 0,
            }
        };
        mine_port_check.run(Game.spawns["Spawn1"].room.name);
        Memory.CreepStat = {
            "Harvester": {
                "name_list": [],
                "max_num": 0
            },
            "Upgrader": {
                "name_list": [],
                "max_num": 0
            },
            "Builder": {
                "name_list": [],
                "max_num": 0
            },
            "Miner": {
                "name_list": [],
                "max_num": 0
            },
            "Carrier": {
                "name_list": [],
                "max_num": 0
            },
            "Refueler": {
                "name_list": [],
                "max_num": 0
            },
            "Claimer": {
                "name_list": [],
                "max_num": 0
            }
        };
    }

    ////    Check Creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            var role = Memory.creeps[name].role;
            switch(role) {
                case "miner":
                    // TODO: remove source/mine assigned mark
                    break;
                case "claimer":
                    if(Memory.RoomsToClaim[Memory.creeps[name].targetRoomID] == 2) {  // reversing
                        Memory.RoomsToClaim[Memory.creeps[name].targetRoomID] = 1;  // to reverse
                    }
                    break;
            }
            var _index = Memory.CreepStat[role].name_list.indexOf(name);
            if(_index != -1) Memory.CreepStat[role].name_list.splice(_index, 1);
            delete Memory.creeps[name];
            console.log(name + " passed away.");
        }
    }
    ////    Adjust Worker Num
    var room_name = Game.spawns["Spawn1"].room.name;
    var room = Game.rooms[room_name];
    Memory.CreepStat.Miner.max_num = Memory.Room[room_name].container_list.length;
    Memory.CreepStat.Carrier.max_num = Memory.CreepStat.Miner.name_list.length;
//    Memory.CreepStat.Builder.max_num = 1;
    if(Memory.Room[room_name].storage_list.length > 0) {
        Memory.CreepStat.Refueler.max_num = Memory.Room[room_name].tower_list.length;
    }
    if(Memory.CreepStat.Carrier.name_list.length == 0) {
        Memory.CreepStat.Harvester.max_num = Object.keys(Memory.Room[room_name].source).length;
    }
    else {
        Memory.CreepStat.Harvester.max_num = 0;
    }
    if(Memory.CreepStat.Upgrader.name_list.length < Memory.CreepStat.Upgrader.max_num
            && Memory.Room[room_name].energy_stat["1000_tick_sum_trend"] < 0) {
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
        if(Memory.Room[room_name].cpu_stat["10000_tick_avg"] < 15
                && (Memory.Room[room_name].energy_stat["1000_tick_sum_trend"] > 50 || room.energyAvailable > 800000)
                && Memory.CreepStat.Upgrader.max_num < room.controller.level) {
            Memory.CreepStat.Upgrader.max_num += 1;
        }
        else if((Memory.Room[room_name].cpu_stat["10000_tick_avg"] > 15
                || Memory.Room[room_name].cpu_stat["10000_tick_avg"] < 0)
                && Memory.CreepStat.Upgrader.max_num > 1) {
            Memory.CreepStat.Upgrader.max_num -= 1;
        }
    }


    // TODO: run spawn
    for(var spawn_name in Memory.Spawn) {
        structureSpawn.run(Game.spawns[spawn_name]);
    }

    // TODO: run tower

    for(var name in Memory.creeps) {
        switch(Memory.creeps[name].role) {
            case "Harvester":
                roleHarvester.run(Game.creeps[name]);
                break;
            case "Upgrader":
                roleUpgrader.run(Game.creeps[name]);
                break;
            case "builder":
                break;
            case "miner":
                break;
            case "carrier":
                break;
            case "refueler":
                break;
            case "claimer":
                break;
        }
    }

    //  check energy and cpu
    stat.run();

}

var DataStruct = function() {
    Memory.Room = {
        "ROOM_NAME_1": {
            "source": {
                "SOURCE_ID_1": {
                    "mine_port": {
                        "x": "X_1",
                        "y": "Y_1"
                    },
                    "assigned_miner": "MINER_NAME_1",
                    "container": "CONTAINER_ID_1"
                },
                "SOURCE_ID_2": {
                    "mine_port": {
                        "x": "X_2",
                        "y": "Y_2"
                    },
                    "assigned_miner": "MINER_NAME_2",
                    "container": "CONTAINER_ID_2"
                }
            },
            "mineral": {
                "MINE_ID_1": {
                    "mine_port": {
                        "x": "X_3",
                        "y": "Y_3"
                    },
                    "assigned_miner": "MINER_NAME_3",
                    "container": "CONTAINER_ID_3"
                }
            },
            "claim_status": "neutral/to_reverse/reversing/to_claim/claiming/claimed",
            "container_list": [],
            "storage_list": [],
        }
    };
    Memory.Spawn = {
        "SPAWN_NAME_1": {
            "creep_spawn_list": ["harvester", "builder"]
        }
    };
    Memory.CreepStat = {
        "harvester": {
            "name_list": [],
            "max_num": 0
        },
        "builder": {
            "name_list": [],
            "max_num": 0
        }
    }
}