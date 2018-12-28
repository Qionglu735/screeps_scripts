
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.memory.target_id = '';
            creep.say('Withdraw');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
            creep.memory.target_id = '';
	        creep.say('Upgrade');
	    }
	    if(creep.memory.upgrading) {
            if(creep.moveTo(Game.flags['UpgraderPark'], {visualizePathStyle: {stroke: '#88ffff'}}) == OK) {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#88ffff'}}) == ERR_NO_PATH) {
                        creep.say('TrafficJam');
                    }
                }
            }
        }
        else {
            var target = Game.getObjectById(creep.memory.target_id);
            //var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target) => 
                                                target.structureType == STRUCTURE_STORAGE
                                                && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target)=>target.structureType == STRUCTURE_CONTAINER
                                                && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
            }
            if(!target) {
                var targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
            }
            creep.memory.target_id = target.id;
            var status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
            if(status == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(target, {visualizePathStyle: {stroke: '#88ffff'}}) == ERR_NO_PATH) {
                    creep.say('TrafficJam');
                }
            }
            else if(status == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.target_id = '';
            }
            else if(status == ERR_INVALID_TARGET) {
                var status = creep.harvest(target);
                if(status == ERR_NOT_IN_RANGE || status == ERR_NOT_ENOUGH_RESOURCES) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#88ffff'}}) == ERR_NO_PATH) {
                        creep.memory.target_id = '';
                        creep.say('TrafficJam');
                    }
                }
            }
            else if(status != OK) {
                creep.say("???");
            }
        }
	}
};

module.exports = roleUpgrader;
