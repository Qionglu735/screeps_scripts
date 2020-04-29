
var find_path_and_move = require("tool.find_path_and_move");

var roleUpgrader = {
    run: function(creep) {
        if(creep.memory.status == null) {
                creep.memory.status = "withdraw";  // withdraw, upgrade
            }
        if(creep.memory.status == "withdraw" && creep.carry.energy == creep.carryCapacity) {
            creep.memory.status = "upgrade";
            creep.memory.target_id = "";
            creep.say("Upgrade");
	    }
	    else if(creep.memory.status == "upgrade" && creep.carry.energy == 0) {
            creep.memory.status = "withdraw";
            creep.memory.target_id = "";
	        creep.say("Withdraw");
	    }
        if(creep.memory.status == "withdraw") {
            var target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType == STRUCTURE_STORAGE
                                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType == STRUCTURE_CONTAINER
                                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
            }
            if(!target) {
                var targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
            }
            if(target) {
                creep.memory.target_id = target.id;
                var status = null;
                if(target.structureType == null) {
                    status = creep.harvest(target);
                }
                else {
                    status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
                }
                find_path_and_move.find(creep, target, status, 3);
            }
            else {
                creep.moveTo(Game.flags['UpgraderPark'], {visualizePathStyle: {stroke: '#88ffff'}});
            }
        }
	    else {
            var upgrade_status = creep.upgradeController(creep.room.controller);
            find_path_and_move.find(creep, creep.room.controller, upgrade_status, 3);
        }
	}
};

module.exports = roleUpgrader;
