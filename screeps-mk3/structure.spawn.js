

var structureSpawn = function(spawn) {
    var room = spawn.room;
    var memory_creep = Memory.my_spawn[spawn.name].creep;
    if(Memory.my_spawn[spawn.name].spawn_cool_down > 0) {
        if(room.energyAvailable == room.energyCapacityAvailable) {
            Memory.my_spawn[spawn.name].spawn_cool_down = 0;
        }
        else {
            Memory.my_spawn[spawn.name].spawn_cool_down -= 1;
        }
    }
    else if (spawn.spawning != null || !room.energyAvailable || room.energyAvailable < 300) {
        ;
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
        //Miner
        if(memory_creep.miner.name_list.length < memory_creep.miner.max_num) {
            var body = [];
            var energy = room.energyAvailable;
            var creepLevel = 0;
            body.push(CARRY);
            energy -= 50;
            while(energy >= 250 && creepLevel < 4) {
                body.push(WORK);
                body.push(WORK);
                body.push(MOVE);
                energy -= 250;
                creepLevel += 1;
            }
            var creep_name = "Miner" + Game.time % 10000 + "Lv" + creepLevel;
            console.log("Spawning: " + creep_name);
            var res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "miner",
                    }
                }
            )
            if(res != OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].creep_spawning = creep_name;
                //memory_creep.miner.name_list.push(creep_name);
            }
        }
        //Harvester
        else if(memory_creep.harvester.name_list.length < memory_creep.harvester.max_num) {
            var body = [];
            var energy = room.energyAvailable;
            var creepLevel = 0;
            while(energy >= 200) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            var creep_name = "Harvester" + Game.time % 10000 + "Lv" + creepLevel;
            console.log("Spawning: " + creep_name);
            var res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "harvester",
                    }
                }
            );
            if(res != OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].creep_spawning = creep_name;
                //memory_creep.harvester.name_list.push(creep_name);
            }
        }
        //Upgrader
        else if(memory_creep.upgrader.name_list.length < memory_creep.upgrader.max_num) {
            var body = [];
            var energy = room.energyAvailable;
            var creepLevel = 0;
            while(energy >= 200) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
                energy -= 200;
                creepLevel += 1;
            }
            var creep_name = "Upgrader" + Game.time % 10000 + "Lv" + creepLevel;
            console.log("Spawning: " + creep_name);
            var res = spawn.spawnCreep(body, creep_name, {
                    memory: {
                        role: "upgrader",
                    }
                }
            );
            if(res != OK) {
                console.log(res);
            }
            else {
                Memory.my_spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                //Memory.my_spawn[spawn.name].spawning_creep = creep_name;
                //memory_creep.upgrader.name_list.push(creep_name);
            }
        }
    }
};

module.exports = structureSpawn;
