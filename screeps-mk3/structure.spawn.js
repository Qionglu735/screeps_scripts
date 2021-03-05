
let structure_spawn = function(spawn) {
    let room = spawn.room;
    let memory_creep = Memory.my_spawn[spawn.name].creep;
    if (spawn.spawning != null) {
        console.log(spawn.name, "spawning", spawn.spawning.name, room.energyAvailable);
    }
    else if(!room.energyAvailable || room.energyAvailable < 300) {
        console.log(spawn.name, "energy_low", room.energyAvailable);
    }
    else if(Memory.my_spawn[spawn.name].spawn_cool_down > 0) {
        console.log(spawn.name, "spawn_cool_down", Memory.my_spawn[spawn.name].spawn_cool_down, room.energyAvailable);
        if(room.energyAvailable === room.energyCapacityAvailable) {
            Memory.my_spawn[spawn.name].spawn_cool_down = 0;
        }
        else {
            Memory.my_spawn[spawn.name].spawn_cool_down -= 1;
        }
    }
    else {
        //if (Memory.my_spawn[spawn.name].creep_spawning != null) {
        //    let creep_name = Memory.my_spawn[spawn.name].creep_spawning;
        //    Memory.my_spawn[spawn.name].creep_spawning = null;
        //    if (Game.creep[creep_name] != null) {
        //        let creep = Game.creep[creep_name];
        //        memory_creep[creep.memeory.role].name_list.push(creep_name);
        //    }
        //}
        let body = [];
        let energy = room.energyAvailable;
        let creepLevel = 0;
        //Miner
        if(memory_creep.miner.name_list.length < memory_creep.miner.max_num) {
            body.push(CARRY);
            energy -= 50;
            while(energy >= 250 && creepLevel < 4) {
                body.push(WORK);
                body.push(WORK);
                body.push(MOVE);
                energy -= 250;
                creepLevel += 1;
            }
            let creep_name = "Miner" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "miner",
                    }
                }
            )
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].creep_spawning = creep_name;
                //memory_creep.miner.name_list.push(creep_name);
            }
        }
        // Harvester
        else if(memory_creep.harvester.name_list.length < memory_creep.harvester.max_num) {
            while(energy >= 200) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            let creep_name = "Harvester" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "harvester",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].creep_spawning = creep_name;
                //memory_creep.harvester.name_list.push(creep_name);
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
            let creep_name = "Carrier" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn " + creep_name);
            let res = spawn.spawnCreep(body, "Carrier" + Game.time % 10000 + "Lv" + creepLevel, {
                    memory: {
                        role: "carrier",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
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
            let creep_name = "Refueler" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, "Refueler" + Game.time % 10000 + "Lv" + creepLevel, {
                    memory: {
                        role: "refueler",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
            }
        }
        // Scout
        else if(memory_creep.scout.name_list.length < memory_creep.scout.max_num) {
            while(energy > 50 && creepLevel < 1) {
                body.push(MOVE);
                energy -= 50;
                creepLevel += 1;
            }
            creepLevel += 1;
            let creep_name = "Scout" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, "Scout" + Game.time % 10000 + "Lv" + creepLevel, {
                    memory: {
                        role: "scout",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
            }
        }
        // Claimer
        else if(memory_creep.claimer.name_list.length < memory_creep.claimer.max_num) {
            while(energy > 650 && creepLevel < 1) {
                body.push(CLAIM);
                body.push(MOVE);
                energy -= 650;
                creepLevel += 1;
            }
            let creep_name = "Claimer" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, "Claimer" + Game.time % 10000 + "Lv" + creepLevel, {
                    memory: {
                        role: "claimer",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
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
            let creep_name = "Upgrader" + Game.time % 10000 + "Lv" + creepLevel;
            console.log(spawn.name, "spawn", creep_name);
            let res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "upgrader",
                    }
                }
            );
            if(res !== OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].spawning_creep = creep_name;
                //memory_creep.upgrader.name_list.push(creep_name);
            }
        }
        else {
            console.log(spawn.name, "Idle")
        }
    }
};

module.exports = structure_spawn;
