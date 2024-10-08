
let structure_spawn = function(spawn) {
    let room = spawn.room;
    let memory_creep = Memory.room_dict[room.name].creep;
    let energy_capacity = room.energyCapacityAvailable;
    if(Number.isNaN(energy_capacity)) {
        // Server Bug: energyCapacityAvailable is NaN
        energy_capacity = Memory.room_dict[room.name].extension_list.length * 50;
        if(room.controller.level === 7) {
            energy_capacity = Memory.room_dict[room.name].extension_list.length * 100;
        }
        else if(room.controller.level === 8) {
            energy_capacity = Memory.room_dict[room.name].extension_list.length * 200;
        }
    }
    if (spawn.spawning != null) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "spawning", spawn.spawning.name,
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
    }
    else if(!room.energyAvailable || room.energyAvailable < 300) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "energy_low",
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
    }
    else if(Memory.room_dict[room.name].spawn_cool_down > 0) {
        Memory.room_dict[room.name].spawn_busy_time += 1;
        console.log(spawn.name, "Cool_Down:", Memory.room_dict[room.name].spawn_cool_down + "s",
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
        if(room.energyAvailable >= energy_capacity) {
            Memory.room_dict[room.name].spawn_cool_down = 0;
        }
        else {
            Memory.room_dict[room.name].spawn_cool_down -= 1;
        }
    }
    else {
        let body = [];
        let energy = room.energyAvailable;
        if(energy == null) {
            energy = 200;
        }
        let creepLevel = 0;
        // Harvester
        if(memory_creep.harvester.name_list.length < memory_creep.harvester.max_num) {
            while(energy >= 200 && body.length < MAX_CREEP_SIZE - 3) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Harvester", "harvester", body, creepLevel);
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
            spawn_creep(spawn, room, "Miner", "miner", body, creepLevel);
        }
        // Carrier
        else if(memory_creep.carrier.name_list.length < memory_creep.carrier.max_num) {
            while(energy > 200 && creepLevel < 10) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Carrier", "carrier", body, creepLevel);
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
            spawn_creep(spawn, room, "Refueler", "refueler", body, creepLevel);
        }
        // Scout
        else if(memory_creep.scout.name_list.length < memory_creep.scout.max_num) {
            while(energy > 50 && creepLevel < 1) {
                body.push(MOVE);
                energy -= 50;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Scout", "scout", body, creepLevel);
        }
        // Claimer
        else if(memory_creep.claimer.name_list.length < memory_creep.claimer.max_num && energy > 650) {
            while(energy > 650 && creepLevel < 1) {
                body.push(CLAIM);
                body.push(MOVE);
                energy -= 650;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Claimer", "claimer", body, creepLevel);
        }
        // Upgrader
        else if(memory_creep.upgrader.name_list.length < memory_creep.upgrader.max_num) {
            while(energy >= 200 && body.length < MAX_CREEP_SIZE - 3) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Upgrader", "upgrader", body, creepLevel);
        }
        else {
            Memory.room_dict[room.name].spawn_idle_time += 1;
            Memory.room_dict[room.name].spawn_busy_time = 0;
            console.log(spawn.name, room.energyAvailable + "/" + energy_capacity,
                "Idle:", Memory.room_dict[room.name].spawn_idle_time + "s");
        }
    }
};

let spawn_creep = function(spawn, room, name, role, body, level) {
    let creep_name = `${name}${Game.time % 10000}_Lv${level}`;
    console.log(spawn.name, "spawn", creep_name,
        // room.energyAvailable + "/" + energy_capacity,
        "Busy:", Memory.room_dict[room.name].spawn_busy_time + "s");
    // console.log(body)
    let res = spawn.spawnCreep(body, creep_name, {
            memory: {
                main_room: room.name,
                level: level,
                role: role,
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

module.exports = structure_spawn;
