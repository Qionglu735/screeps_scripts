
//ATTACK 80 RANGED_ATTACK 150 HEAL 250 CLAIM 600
//TOUGH 10 MOVE 50

//role.Guard, role.Scout

var spawnMilitary = {
    run:function(spawn, room) {
        //if(true) {return;}
        
        //Type.A, Type.R, Type.H, Type.AR, Type.AT, Type.RT
        var MilitaryCreeps = [1, 1, 1];
        var warriors = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeA');
        var archers = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeR');
        var healers = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeH');
        
        if(spawn.spawning == null && room.energyAvailable >= 300 && Memory.SpawnCooldown == 0){
            if(Memory.ScoutNum < 1) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy >= 250 && creepLevel < 1) {
                    body.push(TOUGH); body.push(TOUGH);
                    body.push(ATTACK);
                    body.push(MOVE); body.push(MOVE); body.push(MOVE);
                    energy -= 250;
                    creepLevel += 1;
                }
                console.log("Spawning: Scout" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Scout" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Scout"
                                    }
                                }
                            )
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            else if(warriors.length < MilitaryCreeps[0]) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy >= 250 && creepLevel < 3) {
                    body.push(TOUGH); body.push(TOUGH);
                    body.push(ATTACK);
                    body.push(MOVE); body.push(MOVE); body.push(MOVE);
                    energy -= 250;
                    creepLevel += 1;
                }
                console.log("Spawning: Warrier" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Warrier" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Guard",
                                        type: "TypeA"
                                    }
                                }
                            )
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            else if(archers.length < MilitaryCreeps[1]) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy >= 260 && creepLevel < 3) {
                    body.push(TOUGH);
                    body.push(RANGED_ATTACK);
                    body.push(MOVE); body.push(MOVE);
                    energy -= 260;
                    creepLevel += 1;
                }
                console.log("Spawning: Archer" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Archer" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Guard",
                                        type: "TypeR"
                                    }
                                }
                            )
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            else if(healers.length < MilitaryCreeps[2]) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy >= 300 && creepLevel < 3) {
                    body.push(HEAL);
                    body.push(MOVE);
                    energy -= 300;
                    creepLevel += 1;
                }
                console.log("Spawning: Healer" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Healer" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Guard",
                                        type: "TypeH",
                                        targetName: ''
                                    }
                                }
                            )
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}

module.exports = spawnMilitary
