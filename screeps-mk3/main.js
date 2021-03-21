
// https://docs.screeps.com/api/#Game

require("constant")

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

    let cpu = Game.cpu.getUsed();

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

    console.log("################################################################################");
    console.log("parse memory", (Game.cpu.getUsed() - cpu).toFixed(3))

    ////    Memory Control
    ////    Memory.MemoryControl: 0 == normal, 1 == reset
    ////    Use console to set value: Memory.MemoryControl = 1
    if(Memory.MemoryControl == null) {
        Memory.MemoryControl = 1;
    }
    if(Memory.MemoryControl === 1 && Game.spawns[FIRST_SPAWN_NAME]) {
        //// init memory
        console.log("init memory");

        for(let i in Memory) {
            if(i !== "creeps") {
                delete Memory[i];
            }
        }
        let first_room_name = Game.spawns[FIRST_SPAWN_NAME].room.name
        Memory.room_list = [first_room_name];
        Memory.room_dict = {};
        Memory.room_dict[first_room_name] = {
            ...ROOM_TEMPLATE,
            ...MAIN_ROOM_TEMPLATE
        };
        Memory.room_dict[first_room_name].main_room = first_room_name;
        Memory.room_dict[first_room_name].room_distance[first_room_name] = 0;
        Memory.room_dict[first_room_name].claim_status = "claimed";
        Memory.room_dict[first_room_name].spawn_list.push(FIRST_SPAWN_NAME);
        Memory.main_room_list = [first_room_name];
        Memory.cpu_stat = {...CPU_STAT_TEMPLATE};

        Memory.MemoryControl = 0;
    }
    ////    Memory Hotfix
    ////    Use console to set value: Memory.MemoryControl = 2
    if(Memory.MemoryControl === 2) {
        Memory.MemoryControl = 0;
        ////
        Memory.room_dict["W8N3"].energy_stat.energy_track = [];
        ////
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
                        let source = Game.getObjectById(source_id);
                        if(source != null) {
                            room_name = Game.getObjectById(source_id).room.name;
                            if (Memory.room_dict[room_name].source[source_id].assigned_miner === creep_name) {
                                Memory.room_dict[room_name].source[source_id].assigned_miner = null;
                            }
                        }
                        break;
                    case "claimer":
                        room_name = Memory.creeps[creep_name].target_room;
                        if (room_name != null && Memory.room_dict[room_name].assigned_claimer === creep_name) {
                            Memory.room_dict[room_name].assigned_claimer = null;
                        }
                        break;
                    default:
                        break;
                }
                let main_room_name = Memory.creeps[creep_name].main_room;
                let _index = Memory.room_dict[main_room_name].creep[role].name_list.indexOf(creep_name);
                if (_index !== -1) Memory.room_dict[main_room_name].creep[role].name_list.splice(_index, 1);
                delete Memory.creeps[creep_name];
                console.log(creep_name + " passed away.");
            }
            else if (Game.creeps[creep_name].spawning) {

            }
            else {
                let main_room_name = Memory.creeps[creep_name].main_room;
                let creep_role = Memory.creeps[creep_name].role;
                if (!Memory.room_dict[main_room_name].creep[creep_role].name_list.includes(creep_name)) {
                    Memory.room_dict[main_room_name].creep[creep_role].name_list.push(creep_name);
                }
            }
        }
    }
    for(let room_name of Memory.main_room_list) {
        let reducer = (accumulator, currentValue) => accumulator + currentValue;
        for(let role in Memory.room_dict[room_name].creep) {
            if(Memory.room_dict[room_name].creep.hasOwnProperty(role)) {
                let creep_level_list = [];
                for(let creep_name of Memory.room_dict[room_name].creep[role].name_list) {
                    creep_level_list.push(Game.creeps[creep_name].memory.level);
                }
                if(creep_level_list.length > 0) {
                    Memory.room_dict[room_name].creep[role].avg_level =
                        (creep_level_list.reduce(reducer) / creep_level_list.length).toFixed(1);
                }
            }
        }
    }
    // console.log("check creep", (Game.cpu.getUsed() - cpu).toFixed(3));

    // check building, adjust worker number
    cpu = Game.cpu.getUsed();
    for(let room_name of Memory.main_room_list) {
        global_manage(room_name);
    }
    console.log("global manage", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run spawn
    // cpu = Game.cpu.getUsed();
    for(let room_name of Memory.main_room_list) {
        for(let spawn_name of Memory.room_dict[room_name].spawn_list) {
            structure_spawn(Game.spawns[spawn_name]);
        }
    }
    // console.log("run spawn", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run tower
    // cpu = Game.cpu.getUsed();
    for(let room_name of Memory.main_room_list) {
        for(let tower_id of Memory.room_dict[room_name].tower_list) {
            structure_tower(Game.getObjectById(tower_id));
        }
    }
    // console.log("run tower", (Game.cpu.getUsed() - cpu).toFixed(3));

    // run creep
    cpu = Game.cpu.getUsed();
    let large_cpu_creep_list = []
    for (let creep_name in Memory.creeps) {
        if(Memory.creeps.hasOwnProperty(creep_name)) {
            if (Game.creeps[creep_name].spawning) {
                continue;
            }
            let role_cpu = Game.cpu.getUsed();
            switch (Memory.creeps[creep_name].role) {
                case "harvester":
                    role_harvester(Game.creeps[creep_name]);
                    break;
                case "miner":
                    role_miner(Game.creeps[creep_name]);
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
            role_cpu = Game.cpu.getUsed() - role_cpu;
            if(role_cpu > 1) {
                large_cpu_creep_list.push(creep_name + ":" + role_cpu.toFixed(3) + "s");
            }
        }
    }
    console.log("run creep", (Game.cpu.getUsed() - cpu).toFixed(3));
    // if(large_cpu_creep_list.length > 0) {
    //     console.log(large_cpu_creep_list.join(","))
    // }
    // else {
    //     console.log();
    // }

    // check energy, cpu
    stat();
}
