
let structure_spawn = function(spawn) {
    let room = spawn.room;
    let memory_creep = Memory.room_dict[room.name].creep;
    if (spawn.spawning != null) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "spawning", spawn.spawning.name,
            room.energyAvailable + "/" + room.energyCapacityAvailable,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
    }
    else if(!room.energyAvailable || room.energyAvailable < 300) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "energy_low",
            room.energyAvailable + "/" + room.energyCapacityAvailable,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
    }
    else if(Memory.room_dict[room.name].spawn_cool_down > 0) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "Cool_Down:", Memory.room_dict[room.name].spawn_cool_down + "s",
            room.energyAvailable + "/" + room.energyCapacityAvailable,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
        if(room.energyAvailable === room.energyCapacityAvailable) {
            Memory.room_dict[room.name].spawn_cool_down = 0;
        }
        else {
            Memory.room_dict[room.name].spawn_cool_down -= 1;
        }
    }
    else {
        let body = [];
        let energy = room.energyAvailable;
        let creepLevel = 0;
        // Harvester
        if(memory_creep.harvester.name_list.length < memory_creep.harvester.max_num) {
            while(energy >= 200) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            let creep_name = "Harvester" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "harvester",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        //Miner
        else if(memory_creep.miner.name_list.length < memory_creep.miner.max_num
            && (memory_creep.miner.name_list.length <= memory_creep.carrier.name_list.length
            || memory_creep.miner.name_list.length < 2)) {
            body.push(CARRY);
            energy -= 50;
            while(energy >= 250 && creepLevel < 4) {
                body.push(WORK);
                body.push(WORK);
                body.push(MOVE);
                energy -= 250;
                creepLevel += 1;
            }
            let creep_name = "Miner" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "miner",
                    }
                }
            )
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        // Carrier
        else if(memory_creep.carrier.name_list.length < memory_creep.carrier.max_num) {
            while(energy > 200) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            let creep_name = "Carrier" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn " + creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, "Carrier" + Game.time % 10000 + "_Lv" + creepLevel, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "carrier",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        // Refueler
        else if(memory_creep.refueler.name_list.length < memory_creep.refueler.max_num) {
            while(energy > 200 && creepLevel < 5) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            let creep_name = "Refueler" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, "Refueler" + Game.time % 10000 + "_Lv" + creepLevel, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "refueler",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        // Scout
        else if(memory_creep.scout.name_list.length < memory_creep.scout.max_num) {
            while(energy > 50 && creepLevel < 1) {
                body.push(MOVE);
                energy -= 50;
                creepLevel += 1;
            }
            let creep_name = "Scout" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, "Scout" + Game.time % 10000 + "_Lv" + creepLevel, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "scout",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        // Claimer
        else if(memory_creep.claimer.name_list.length < memory_creep.claimer.max_num && energy > 650) {
            while(energy > 650 && creepLevel < 1) {
                body.push(CLAIM);
                body.push(MOVE);
                energy -= 650;
                creepLevel += 1;
            }
            let creep_name = "Claimer" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, "Claimer" + Game.time % 10000 + "_Lv" + creepLevel, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "claimer",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        // Upgrader
        else if(memory_creep.upgrader.name_list.length < memory_creep.upgrader.max_num) {
            while(energy >= 200) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            let creep_name = "Upgrader" + Game.time % 10000 + "_Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name,
                room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        main_room: room.name,
                        level: creepLevel,
                        role: "upgrader",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.room_dict[room.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                Memory.room_dict[room.name].spawn_idle_time = 0;
                Memory.room_dict[room.name].spawn_busy_time += 1;
            }
        }
        else {
            Memory.room_dict[room.name].spawn_idle_time += 1;
            Memory.room_dict[room.name].spawn_busy_time = 0;
            console.log(spawn.name, room.energyAvailable + "/" + room.energyCapacityAvailable,
                "Idle:", Memory.room_dict[room.name].spawn_idle_time + "s");
        }
    }
};

module.exports = structure_spawn;
