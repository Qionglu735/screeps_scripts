

var structureSpawn = {
    run: function(spawn) {
        var room = spawn.room;
        if(Memory.Spawn[spawn.name].spawn_cool_down > 0) {
            if(room.energyAvailable == room.energyCapacityAvailable) {
                Memory.Spawn[spawn.name].spawn_cool_down = 0;
            }
            else {
                Memory.Spawn[spawn.name].spawn_cool_down -= 1;
            }
        }
        else if (spawn.spawning != null || room.energyAvailable < 300) {
            ;
        }
        else {
            //Harvester
            if(Memory.CreepStat.Harvester.name_list.length < Memory.CreepStat.Harvester.max_num) {
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
                            role: "Harvester",
                        }
                    }
                );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.Spawn[spawn.name].spawn_cool_down = body.length * CREEP_SPAWN_TIME * 3;
                    Memory.CreepStat.Harvester.name_list.push(creep_name);
                }
            }
        }
    }
};

module.exports = structureSpawn;
