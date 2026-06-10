
let structure_spawn = function(spawn) {
    let room = spawn.room;
    let room_memory = Memory.room_dict[room.name];
    let room_creep_memory = room_memory.creep;
    let energy_capacity = room.energyCapacityAvailable;
    if(Number.isNaN(energy_capacity)) {
        // Server Bug: energyCapacityAvailable is NaN
        energy_capacity = room_memory.extension_list.length * 50;
        if(room.controller.level === 7) {
            energy_capacity = room_memory.extension_list.length * 100;
        }
        else if(room.controller.level === 8) {
            energy_capacity = room_memory.extension_list.length * 200;
        }
    }
    if (room_memory.spawn_dict[spawn.name] == null) {
        room_memory.spawn_dict[spawn.name] = {
            busy_time: 0,
            idle_time: 0,
            cool_down: 0,
        };
    }
    let spawn_memory = room_memory.spawn_dict[spawn.name];
    if (spawn.spawning != null) {
        spawn_memory.busy_time += 1;
        console.log(spawn.name, "spawning:", spawn.spawning.name,
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", spawn_memory.busy_time + "s");
    }
    else if (room_memory.spawn_creep_time === Game.time) {
        spawn_memory.busy_time += 1;
        console.log(spawn.name, "time_skip",
            room.energyAvailable + "/" + energy_capacity);
    }
    else if(!room.energyAvailable || room.energyAvailable < 300) {
        spawn_memory.busy_time += 1;
        console.log(spawn.name, "energy_low",
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", spawn_memory.busy_time + "s");
    }
    else if(spawn_memory.cool_down > 0) {
        spawn_memory.busy_time += 1;
        console.log(spawn.name, "cool_down:", spawn_memory.cool_down + "s",
            room.energyAvailable + "/" + energy_capacity,
            "Busy:", spawn_memory.busy_time + "s");
        if(room.energyAvailable >= energy_capacity) {
            spawn_memory.cool_down = 0;
        }
        else {
            spawn_memory.cool_down -= 1;
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
        if(room_creep_memory.harvester.name_list.length < room_creep_memory.harvester.max_num) {
            while(energy >= 200 && creepLevel < room.controller.level) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Harvester", "harvester", body, creepLevel);
        }
        // Miner
        else if(room_creep_memory.miner.name_list.length < room_creep_memory.miner.max_num
            && (room_creep_memory.miner.name_list.length <= room_creep_memory.carrier.name_list.length
            || room_creep_memory.miner.name_list.length < 2)
        ) {
            body.push(CARRY);
            energy -= 50;
            while(energy >= 250 && creepLevel < 2) {
                body.push(WORK);
                body.push(WORK);
                body.push(MOVE);
                energy -= 250;
                creepLevel += 1;
            }
            if (energy >= 100 && creepLevel == 2) {
                body.push(WORK);
                energy -= 100;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Miner", "miner", body, creepLevel);
        }
        // Carrier
        else if(room_creep_memory.carrier.name_list.length < room_creep_memory.carrier.max_num) {
            while(energy > 200 && creepLevel < 6) {
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
        else if(room_creep_memory.refueler.name_list.length < room_creep_memory.refueler.max_num) {
            while(energy > 200 && creepLevel < 3) {
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
        else if(room_creep_memory.scout.name_list.length < room_creep_memory.scout.max_num) {
            while(energy > 50 && creepLevel < 1) {
                body.push(MOVE);
                energy -= 50;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Scout", "scout", body, creepLevel);
        }
        // Claimer
        else if(room_creep_memory.claimer.name_list.length < room_creep_memory.claimer.max_num && energy > 650) {
            while(energy > 650 && creepLevel < 1) {
                body.push(CLAIM);
                body.push(MOVE);
                energy -= 650;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Claimer", "claimer", body, creepLevel);
        }
        // Dealer
        else if(room_creep_memory.dealer.name_list.length < room_creep_memory.dealer.max_num) {
            body.push(MOVE);
            while(energy > 200 && creepLevel < 6) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(CARRY);
                body.push(CARRY);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Dealer", "dealer", body, creepLevel);
        }
        // Upgrader
        else if(room_creep_memory.upgrader.name_list.length < room_creep_memory.upgrader.max_num) {
            while(energy >= 200 && creepLevel < room.controller.level) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            spawn_creep(spawn, room, "Upgrader", "upgrader", body, creepLevel);
        }
        else {
            spawn_memory.idle_time += 1;
            spawn_memory.busy_time = 0;
            console.log(spawn.name, room.energyAvailable + "/" + energy_capacity,
                "Idle:", spawn_memory.idle_time + "s");
        }
    }
};

function spawn_creep(spawn, room, name, role, body, level) {
    let room_memory = Memory.room_dict[room.name];
    let spawn_memory = room_memory.spawn_dict[spawn.name];
    let creep_name = `${name}${Game.time % 10000}_Lv${level}`;
    console.log(spawn.name, "spawn", creep_name,
        // room.energyAvailable + "/" + energy_capacity,
        "Busy:", spawn_memory.busy_time + "s");
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
        room_memory.spawn_creep_time = Game.time;
        spawn_memory.cool_down = body.length * CREEP_SPAWN_TIME * 3;
        spawn_memory.idle_time = 0;
        spawn_memory.busy_time += 1;
    }
}

module.exports = structure_spawn;
