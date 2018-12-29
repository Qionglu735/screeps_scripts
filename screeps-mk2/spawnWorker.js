
var globalFind = require("tool.globalFind");

var spawnWorker = {
    run: function(spawn, room) {
        if(spawn.spawning == null && room.energyAvailable >= 300 && Memory.SpawnCooldown == 0) {
            if(globalFind.find(FIND_CONSTRUCTION_SITES).length <= 2) {
                Memory.MaxBuilder = 1;
            }
            else {
                Memory.MaxBuilder = 3;
            }
            var stroageNum = room.find(FIND_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_STORAGE}).length;
            var containerNum = globalFind.find(FIND_STRUCTURES, {filter:{structureType: STRUCTURE_CONTAINER}}).length;
            var towerNum = room.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER}).length;
            //Miner
            if(Memory.MinerNum < containerNum) {
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
                console.log("Spawning: Miner" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Miner" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Miner",
                                        targetID: -1,
                                        targetPos: new RoomPosition(-1, -1, "None"),
                                        container_id: ''
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
            //Carrier
            else if(Memory.CarrierNum < Memory.MinerNum) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy > 200) {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(MOVE);
                    energy -= 200;
                    creepLevel += 1;
                }
                console.log("Spawning: Carrier" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Carrier" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Carrier",
                                        harvesting: false
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Refueler
            else if((Memory.RefuelerNum < towerNum && stroageNum > 0)) {
                var body = [];
                var energy = room.energyAvailable;
                var creepLevel = 0;
                while(energy >= 200) {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                    body.push(MOVE);
                    energy -= 200;
                    creepLevel += 1;
                }
                console.log("Spawning: Refueler" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Refueler" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Refueler",
                                        Withdrawing: false
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Harvester
            else if(Memory.CarrierNum < 1 && Memory.HarvesterNum < Memory.MinePort.length) {
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
                console.log("Spawning: Harvester" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Harvester" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Harvester",
                                        harvesting: false
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Upgrader
            else if(Memory.UpgraderNum < 1) {
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
                console.log("Spawning: Upgrader" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Upgrader" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Upgrader",
                                        target_id: '',
                                        harvesting: false
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Builder
            else if(Memory.BuilderNum < Memory.MaxBuilder) {
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
                console.log("Spawning: Builder" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Builder" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Builder",
                                        target_id: '',
                                        harvesting: false
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Claimer
            else if((Memory.RoomsToClaim.includes(1) || Memory.RoomsToClaim.includes(3)) && room.energyAvailable >= 1300) {
                var body = [];
                body.push(MOVE);
                body.push(MOVE);
                body.push(CLAIM);
                body.push(CLAIM);
                console.log("Spawning: Claimer" + Game.time % 10000 + "Lv" + 2);
                var res = spawn.spawnCreep(body, "Claimer" + Game.time % 10000 + "Lv" + 2, {
                                    memory: {
                                        role: "Claimer",
                                        targetRoomName: '',
                                        targetRoomID: -1
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            //Extra Upgrader
            else if(Memory.UpgraderNum < Memory.MaxUpgrader) {
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
                console.log("Spawning: Upgrader" + Game.time % 10000 + "Lv" + creepLevel);
                var res = spawn.spawnCreep(body, "Upgrader" + Game.time % 10000 + "Lv" + creepLevel, {
                                    memory: {
                                        role: "Upgrader",
                                        target_id: '',
                                        harvesting: false
                                    }
                                }
                            );
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
};

module.exports = spawnWorker;
