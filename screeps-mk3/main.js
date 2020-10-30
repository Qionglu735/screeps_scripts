
// https://docs.screeps.com/api/#Game

let structure_spawn = require("structure.spawn");
let structure_tower = require("structure.tower");

let role_harvester = require("role.harvester");
let role_upgrader = require("role.upgrader");
let role_miner = require("role.miner");

let global_manage = require("tool.global_manage");
let stat = require("tool.stat");

module.exports.loop = function () {

    // return;  // All Stop

    ////    Loop Control
    ////    Memory.LoopControl: -1 == normal, 0 == pause, N(N>0) == N step
    ////    Use console to set value: Memory.LoopControl = 0
    if(Memory.LoopControl == null) {
        Memory.LoopControl = 0;
    }
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
                "room": {},
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
        Memory.my_spawn["Spawn1"].room[Game.spawns["Spawn1"].room.name] = {
            "spawn_name": "Spawn1",
            "source": {},
            "mineral": {},
            "claim_status": "claimed",
        };
        Memory.cpu_stat = {
            "cpu_track": [],
            "60_tick_sum": 0, "60_tick_avg": 0,  // 1 minute
            "600_tick_sum": 0, "600_tick_avg": 0,  // 10 minute
            "3600_tick_sum": 0, "3600_tick_avg": 0,  // 1 hour
        };
    }

    ////    Check Creeps
    for(let creep_name in Memory.creeps) {
        if (Memory.creeps.hasOwnProperty(creep_name)) {
            if (!Game.creeps[creep_name]) {
                let role = Memory.creeps[creep_name].role;
                switch (role) {
                    case "miner":
                        let source_id = Memory.creeps[creep_name].target_id;
                        let room_name = Game.getObjectById(source_id).room.name;
                        if (Memory.my_spawn["Spawn1"].room[room_name].source[source_id].assigned_miner === creep_name) {
                            Memory.my_spawn["Spawn1"].room[room_name].source[source_id].assigned_miner = null;
                        }
                        break;
                    case "claimer":
                        if (Memory.RoomsToClaim[Memory.creeps[creep_name].targetRoomID] === 2) {  // reversing
                            Memory.RoomsToClaim[Memory.creeps[creep_name].targetRoomID] = 1;  // to reverse
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
            if (room_name in Memory.my_spawn["Spawn1"].room
                && !Memory.my_spawn["Spawn1"].creep[creep_role].name_list.includes(creep_name)) {
                Memory.my_spawn["Spawn1"].creep[creep_role].name_list.push(creep_name);
            }
        }
    }

    // check building, adjust worker number
    for(let spawn_name in Memory.my_spawn) {
        global_manage(spawn_name);
    }

    // run spawn
    for(let spawn_name in Memory.my_spawn) {
        structure_spawn(Game.spawns[spawn_name]);
    }

    // run tower
    for(let spawn_name in Memory.my_spawn) {
        let towers = Game.spawns[spawn_name].room.find(
            FIND_MY_STRUCTURES, {
                filter: (target) => target.structureType === STRUCTURE_TOWER
            });
        for(let tower in towers) {
            if(towers.hasOwnProperty(tower)) {
                structure_tower(towers[tower]);
            }
        }
    }

    // run creep
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
                case "upgrader":
                    role_upgrader(Game.creeps[creep_name]);
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
    }

    // check energy, cpu
    stat();
}
