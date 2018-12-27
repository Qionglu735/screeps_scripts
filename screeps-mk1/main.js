
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleCarrier = require('role.carrier');

var towerControl = require('structure.towerControl')

var roleGuard = require('role.guard');

var spawnWorker = require('spawnWorker');
var spawnMilitary = require('spawnMilitary');

var memoryModify = require('tool.memoryModify');


//DEFCON_5: Safe
//DEFCON_4: Structure Under Attack
//DEFCON_3: Creeps Under Attack
//DEFCON_2: Energy Low
//DEFCON_1: Spawn Under Attack

module.exports.loop = function () {

    var MainSpawn = Game.spawns['Spawn1'];
    var MainRoom = MainSpawn.room;
    
    if(!Memory.MinePos) {
        Memory.MinePos = [new RoomPosition(35, 31, MainRoom.name),new RoomPosition(16, 23, MainRoom.name)];
    }
    if(!Memory.MineAssigned) {
        Memory.MineAssigned = [false,false];
    }

    var towers = MainRoom.find(FIND_MY_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_TOWER});
    for(var tower in towers) {
        towerControl.run(towers[tower]);
    }
    
    memoryModify.run();
    //roleMiner.run(Game.creeps['Harvester1430569Lv0']);
    
    if(!Game.cpu.limit || Game.cpu.bucket > Game.cpu.limit) {
        
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log(name + " passed away.");
            }
        }
        
        if(spawnWorker.run(MainSpawn, MainRoom) == false) {
            spawnMilitary.run(MainSpawn, MainRoom);
        }
        
        //var startCpu = Game.cpu.getUsed();
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'Harvester') {
                roleHarvester.run(creep);
            }
            else if(creep.memory.role == 'Upgrader') {
                roleUpgrader.run(creep);
            }
            else if(creep.memory.role == 'Builder') {
                roleBuilder.run(creep);
            }
            else if(creep.memory.role == 'Miner') {
                roleMiner.run(creep);
            }
            else if(creep.memory.role == 'Carrier') {
                roleCarrier.run(creep);
            }
            else if(creep.memory.role == 'Guard') {
                roleGuard.run(creep);
            }
        }
        //console.log('Creeps has used ' + (Game.cpu.getUsed() - startCpu) + ' CPU time');
    }
    else {
        console.log(Game.cpu.bucket);
    }
}
