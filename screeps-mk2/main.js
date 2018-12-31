
var minePortCheck = require('tool.minePortCheck');
var memoryModify = require('tool.memoryModify');

var spawnWorker = require('spawnWorker');
var spawnMilitary = require('spawnMilitary');
var spawnClaimer = require("spawnClaimer");

var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');
var roleRefueler = require("role.refueler");
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleClaimer = require("role.claimer");

var roleScout = require('role.scout');
var roleGuard = require('role.guard');

var towerControl = require('structure.towerControl');
var stat = require("tool.stat");

//DEFCON_5: Safe
//DEFCON_4: Structure Under Attack
//DEFCON_3: Creeps Under Attack
//DEFCON_2: Energy Low
//DEFCON_1: Spawn Under Attack

// if creep.hit < creep.hitMax spawnMilitary first

module.exports.loop = function () {
    
    if(true) {
    
        var MainSpawn = Game.spawns['Spawn1'];
        var MainRoom = MainSpawn.room;
        
        if(typeof Memory.Spawns == "undefined") {
            Memory.Spawns = [Game.spawns['Spawn1']];
            Memory.Rooms = [MainRoom];
            Memory.RoomsToClaim = [5];//0==neutral, 1==to reverse, 2==reversing, 3==to claim, 4==claiming, 5==claimed
        }
        
        if(typeof Memory.Range == "undefined") {
            Memory.Range = 0;
        }
        
        if(typeof Memory.MinePort == "undefined") {
            Memory.MinePort = [];
            Memory.MineRange = [];
            Memory.MineType = [];
            Memory.MineAssigned = [];
            minePortCheck.run(MainRoom, MainSpawn.pos);
        }
        
        if(typeof Memory.MaxUpgrader == "undefined") {
            Memory.MaxUpgrader = 3;
        }
        if(typeof Memory.MaxBuilder == "undefined") {
            Memory.MaxBuilder = 3;
        }
        
        if(typeof Memory.SpawnCooldown == "undefined") {
            Memory.SpawnCooldown = 0;
        }
        if(Memory.SpawnCooldown > 0) {
            if(MainRoom.energyAvailable == MainRoom.energyCapacityAvailable) {
                Memory.SpawnCooldown = 0;
            }
            else {
                Memory.SpawnCooldown -= 1;
            }
        }
        
        memoryModify.run();
       
        Memory.MinerNum = 0;
        Memory.CarrierNum = 0;
        Memory.RefuelerNum = 0;
        Memory.HarvesterNum = 0;
        Memory.UpgraderNum = 0;
        Memory.BuilderNum = 0;
        Memory.ScoutNum = 0;
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                if(Memory.creeps[name].role == "Miner") {
                    Memory.MineAssigned[Memory.creeps[name].targetID] = false;
                }
                if(Memory.creeps[name].role == "Claimer") {
                    Memory.RoomsToClaim[Memory.creeps[name].targetRoomID] -= 1;
                }
                delete Memory.creeps[name];
                console.log(name + " passed away.");
            }
            else {
                if(Game.creeps[name].memory.role == "Miner") {
                    Memory.MinerNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Carrier") {
                    Memory.CarrierNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Refueler") {
                    Memory.RefuelerNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Harvester") {
                    Memory.HarvesterNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Upgrader") {
                    Memory.UpgraderNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Builder") {
                    Memory.BuilderNum += 1;
                }
                else if(Game.creeps[name].memory.role == 'Claimer') {
                    ;
                }
                else if(Game.creeps[name].memory.role == "Scout") {
                    Memory.ScoutNum += 1;
                }
                else if(Game.creeps[name].memory.role == "Guard") {
                    ;
                }
            }
        }
        for(var name in Memory.creeps) {
            if(Game.creeps[name].memory.role == "Miner") {
                Memory.MineAssigned[Memory.creeps[name].targetID] = true;
                roleMiner.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Carrier") {
                roleCarrier.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Refueler") {
                roleRefueler.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Harvester") {
                roleHarvester.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Upgrader") {
                roleUpgrader.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Builder") {
                roleBuilder.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == 'Claimer') {
                roleClaimer.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Scout") {
                roleScout.run(Game.creeps[name]);
            }
            else if(Game.creeps[name].memory.role == "Guard") {
                roleGuard.run(Game.creeps[name]);
            }
            MainSpawn.renewCreep(Game.creeps[name]);
        }
        console.log("[SpawnLog]Miner:" + Memory.MinerNum, "Carrier:" + Memory.CarrierNum,
                    "Refueler:" + Memory.RefuelerNum,
                    "Harvester:" + Memory.HarvesterNum,
                    "Upgrader:" + Memory.UpgraderNum + "/" + Memory.MaxUpgrader,
                    "Builder:" + Memory.BuilderNum + "/" + Memory.MaxBuilder,
                    "EnergyAvailable:" + MainRoom.energyAvailable, "CoolDown:" + Memory.SpawnCooldown);
        
        if(spawnWorker.run(MainSpawn, MainRoom) == false) {
            if(spawnMilitary.run(MainSpawn, MainRoom) == false) {
                spawnClaimer.run(MainSpawn, MainRoom);
            }
        }
        /*
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'Miner') {
                roleMiner.run(creep);
            }
            else if(creep.memory.role == 'Carrier') {
                roleCarrier.run(creep);
            }
            else if(creep.memory.role == "Refueler") {
                roleRefueler.run(creep);
            }
            else if(creep.memory.role == 'Harvester') {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'Upgrader') {
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role == 'Builder') {
                roleBuilder.run(creep);
            }
            else if(creep.memory.role == 'Claimer') {
                roleClaimer.run(creep);
            }
            else if(creep.memory.role == 'Scout') {
                roleScout.run(creep);
            }
            else if(creep.memory.role == "Guard") {
                roleGuard.run(creep);
            }
            MainSpawn.renewCreep(creep);
        }
        */
        
        var towers = MainRoom.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
        for(var tower in towers) {
            towerControl.run(towers[tower]);
        }
        
        
        stat.run(MainRoom);
    }
}
