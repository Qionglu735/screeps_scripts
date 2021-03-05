
// https://docs.screeps.com/api/#Game

let structure_spawn = require("structure.spawn");
let structure_tower = require("structure.tower");

let role_miner = require("role.miner");
let role_harvester = require("role.harvester");
let role_upgrader = require("role.upgrader");
let role_carrier = require("role.carrier");
let role_refueler = require("role.refueler");
let role_scout = require("role.scout");
let role_claimer = require("role.claimer");

let global_manage = require("tool.global_manage");
let stat = require("tool.stat");

module.exports.loop = function () {
    // return;  // All Stop
    console.log("################################################################################")
    let cpu = Game.cpu.getUsed();
    Memory.creeps;
    console.log("parse memroy", (Game.cpu.getUsed() - cpu).toFixed(3))

    ////    Loop Control
    ////    Memory.LoopControl: -1 == normal, 0 == pause, N(N>0) == N step
    ////    Use console to set value: Memory.LoopControl = -1
    if(Memory.LoopControl == null) {
        Memory.LoopControl = 0;
    }
    ////     Memory.LoopControl = 0;  // All Stop
    if(Memory.LoopControl === 0) {
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
    if(Memory.MemoryControl === 1 && Game.spawns["Spawn1"]) {
        Memory.MemoryControl = 0;
        //// init memory
        console.log("init memory");
        Memory.my_spawn = {
            "Spawn1": {
                "creep_spawn_list": [],
                "spawn_cool_down": 0,
                "extension_list": [],
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
                "creep": {
                    "miner": {
                        "name_list": [],
                        "max_num": 1
                    },
                    "harvester": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "upgrader": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "carrier": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "scout": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "claimer": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "refueler": {
                        "name_list": [],
                        "max_num": 0
                    },
                    "builder": {
                        "name_list": [],
                        "max_num": 0
                    },
                }
            }
        };
        Memory.my_room = {};
        let room_list = [Game.spawns["Spawn1"].room.name];
        let distance_list = [0];
        let i = 0;
        while(i < room_list.length && distance_list[i] < 4) {
            Memory.my_room[room_list[i]] = {
                "source": {},
                "mineral": {},
                "claim_status": "neutral",
                "room_distance": distance_list[i],
            }
            let exit_info = Game.map.describeExits(room_list[i]);
            for(let j of ["1", "3", "5", "7"]){
                if(exit_info[j] != null) {
                    if(! room_list.includes(exit_info[j])) {
                        console.log(exit_info[j], distance_list[i] + 1);
                        room_list.push(exit_info[j]);
                        distance_list.push(distance_list[i] + 1);
                    }
                }
            }
            i += 1;
        }
        Memory.my_room[Game.spawns["Spawn1"].room.name]["spawn_name"] = "Spawn1";
        Memory.my_room[Game.spawns["Spawn1"].room.name]["claim_status"] = "claimed";
        Memory.cpu_stat = {
            "cpu_track": [],
            "60_tick_sum": 0, "60_tick_avg": 0,  // 1 minute
            "600_tick_sum": 0, "600_tick_avg": 0,  // 10 minute
            "3600_tick_sum": 0, "3600_tick_avg": 0,  // 1 hour
        };
    }
    ////    Memory Hotfix
    ////    Use console to set value: Memory.MemoryControl = 2
    if(Memory.MemoryControl === 2) {
        Memory.MemoryControl = 0;
        ////
        Memory.my_spawn["Spawn1"]["extension_list"] = []
        ////
        Memory.LoopControl = 0;
    }

    ////    Check Creeps
    // cpu = Game.cpu.getUsed()
    for(let creep_name in Memory.creeps) {
        if (Memory.creeps.hasOwnProperty(creep_name)) {
            if (!Game.creeps[creep_name]) {
                let role = Memory.creeps[creep_name].role;
                let room_name = null;
                switch (role) {
                    case "miner":
                        let source_id = Memory.creeps[creep_name].target_id;
                        room_name = Game.getObjectById(source_id).room.name;
                        if (Memory.my_room[room_name].source[source_id].assigned_miner === creep_name) {
                            Memory.my_room[room_name].source[source_id].assigned_miner = null;
                        }
                        break;
                    case "claimer":
                        room_name = Memory.creeps[creep_name].target_room;
                        if (Memory.my_room[room_name].claim_status === "reversing") {  // reversing
                            Memory.my_room[room_name].claim_status = "to_reverse";  // to reverse
                        }
                        break;
                }
                let _index = Memory.my_spawn["Spawn1"].creep[role].name_list.indexOf(creep_name);
                if (_index !== -1) Memory.my_spawn["Spawn1"].creep[role].name_list.splice(_index, 1);
                delete Memory.creeps[creep_name];
                console.log(creep_name + " passed away.");
            }
        }
    }
    for (let creep_name in Memory.creeps) {
        if(Memory.creeps.hasOwnProperty(creep_name)) {
            if (Game.creeps[creep_name].spawning) {
                continue;
            }
            let room_name = Game.creeps[creep_name].room.name;
            let creep_role = Memory.creeps[creep_name].role;
            if (room_name in Memory.my_room
                && !Memory.my_spawn["Spawn1"].creep[creep_role].name_list.includes(creep_name)) {
                Memory.my_spawn["Spawn1"].creep[creep_role].name_list.push(creep_name);
            }
        }
    }
    // console.log("check creep", (Game.cpu.getUsed() - cpu).toFixed(3));

    // check building, adjust worker number
    // cpu = Game.cpu.getUsed();
    for(let spawn_name in Memory.my_spawn) {
        global_manage(spawn_name);
    }
    // console.log("global manage", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run spawn
    // cpu = Game.cpu.getUsed();
    for(let spawn_name in Memory.my_spawn) {
        structure_spawn(Game.spawns[spawn_name]);
    }
    // console.log("run spawn", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run tower
    // cpu = Game.cpu.getUsed();
    for(let spawn_name in Memory.my_spawn) {
        for(let tower_id of Memory.my_spawn[spawn_name].tower_list) {
            let tower = Game.getObjectById(tower_id);
            structure_tower(tower);
        }
    }
    // console.log("run tower", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run creep
    cpu = Game.cpu.getUsed();
    for (let creep_name in Memory.creeps) {
        if(Memory.creeps.hasOwnProperty(creep_name)) {
            if (Game.creeps[creep_name].spawning) {
                continue;
            }
            switch (Memory.creeps[creep_name].role) {
                case "miner":
                    role_miner(Game.creeps[creep_name]);
                    break;
                case "harvester":
                    role_harvester(Game.creeps[creep_name]);
                    break;
                case "carrier":
                    role_carrier(Game.creeps[creep_name]);
                    break;
                case "refueler":
                    role_refueler(Game.creeps[creep_name]);
                    break;
                case "upgrader":
                    role_upgrader(Game.creeps[creep_name]);
                    break;
                case "scout":
                    role_scout(Game.creeps[creep_name]);
                    break;
                case "claimer":
                    role_claimer(Game.creeps[creep_name]);
                    break;
                case "builder":
                    break;
            }
        }
    }
    console.log("run creep", (Game.cpu.getUsed() - cpu).toFixed(3));

    // check energy, cpu
    stat();
}
