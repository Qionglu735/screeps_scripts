
// https://docs.screeps.com/api/#Game

var structureSpawn = require("structure.spawn");

var roleHarvester = require("role.harvester");
var roleUpgrader = require("role.upgrader");
var roleMiner = require("role.miner");

var mine_port_check = require("tool.mine_port_check");

var global_manage = require("tool.global_manage");
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
        Memory.my_spawn = {
            "Spawn1": {
                "creep_spawn_list": [],
                "spawn_cool_down": 0,
                "container_list": [],
                "storage_list": [],
                "tower_list": [],
                "energy_stat": {
                    "energy_track": [],
                    "10_tick_sum_a": 0, "10_tick_sum_b": 0, "10_tick_sum_trend": 0,  // 10 second
                    "60_tick_sum_a": 0, "60_tick_sum_b": 0, "60_tick_sum_trend": 0,  // 1 minute
                    "600_tick_sum_a": 0, "600_tick_sum_b": 0, "600_tick_sum_trend": 0,  // 10 minute
                    "3600_tick_sum_a": 0, "3600_tick_sum_b": 0, "3600_tick_sum_trend": 0,  // 1 hour
                    "36000_tick_sum_a": 0, "36000_tick_sum_b": 0, "36000_tick_sum_trend": 0,  // 10 hour
                },
                "room": {
                    Game.spawns["Spawn1"].room.name: {
                        "spawn_name": "Spawn1",
                        "source": {},
                        "mineral": {},
                        "claim_status": "claimed",
                    }
                },
                "creep": {
                    "miner": {
                        "name_list": [],
                        "max_num": 1
                    },
                    "upgrader": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "harvester": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "builder": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "carrier": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "refueler": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "claimer": {
                        "name_list": [],
                        "max_num": 0
                    }
                }
            }
        };
        Memory.cpu_stat = {
            "cpu_track": [],
            "60_tick_sum": 0, "60_tick_avg": 0,  // 1 minute
            "600_tick_sum": 0, "600_tick_avg": 0,  // 10 minute
            "3600_tick_sum": 0, "3600_tick_avg": 0,  // 1 hour
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

    // check building, adjust worker number
    for(var spawn_name in Memory.my_spawn) {
        global_manage(spawn_name);
    }

    // run spawn
    for(var spawn_name in Memory.Spawn) {
        structureSpawn.run(Game.spawns[spawn_name]);
    }

    // run tower

    // run creep
    for(var creep_name in Memory.creeps) {
        var room_name = Game.creeps[creep_name].room.name;
        switch(Memory.creeps[creep_name].role) {
            case "Miner":
                if(room_name in Memory.my_spawn["Spawn_1"].room
                        && !Memory.my_spawn["Spawn_1"].creep.miner.name_list.includes(name))
                    Memory.my_spawn["Spawn_1"].creep.miner.name_list.push(name);
                roleMiner.run(Game.creeps[name]);
                break;
            case "Harvester":
                if(room_name in Memory.my_spawn["Spawn_1"].room
                        && !Memory.my_spawn["Spawn_1"].creep.harvester.name_list.includes(name))
                    Memory.my_spawn["Spawn_1"].creep.harvester.name_list.push(name);
                roleHarvester.run(Game.creeps[name]);
                break;
            case "Upgrader":
                if(room_name in Memory.my_spawn["Spawn_1"].room
                        && !Memory.my_spawn["Spawn_1"].creep.upgrader.name_list.includes(name))
                    Memory.my_spawn["Spawn_1"].creep.upgrader.name_list.push(name);
                roleUpgrader.run(Game.creeps[name]);
                break;
            case "builder":
                break;
            case "carrier":
                break;
            case "refueler":
                break;
            case "claimer":
                break;
        }
    }

    // check energy, cpu
    stat();

}