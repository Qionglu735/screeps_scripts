
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.target_id = '';
            creep.say('Withdraw');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
            creep.memory.target_id = '';
	        creep.say('Build');
	    }
	    if(creep.memory.building) {
            var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            if(!target) {
                target = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (target) => target.id == creep.memory.target_id})[0];
            }
            if(target && target.hits && target.hits == target.hitsMax) {
                target = null;
            }
            if(!target && parseInt(Math.random() * 1000) % 2 == 0) {
                target = creep.room.find(FIND_CONSTRUCTION_SITES)[0];
            }
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure) => (structure.hits < structure.hitsMax)});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
            }
            if(target) {
                creep.memory.target_id = target.id;
                var status = creep.repair(target);
                if(status == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff88ff'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                }
                else if(status == ERR_INVALID_TARGET) {
                    if(creep.build(target) == ERR_NOT_IN_RANGE) {
                        if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff88ff'}}) == ERR_NO_PATH) {
                            creep.say("TrafficJam");
                        }
                    }
                }
            }
            else {
                creep.moveTo(Game.flags['BuilderPark'], {visualizePathStyle: {stroke: '#ff88ff'}});
            }
        }
        else {
            var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target)=> target.structureType == STRUCTURE_CONTAINER &&
                                                target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy ||
                                                target.structureType == STRUCTURE_STORAGE &&
                                                target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
                else {
                    targets = creep.room.find(FIND_SOURCES);
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
            }
            if(!target) {
                target = creep.room.find(FIND_SOURCES, {filter: (target) => target.id == creep.memory.target_id})[0];
            }
            if(!target) {
                var targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
            }
            creep.memory.target_id = target.id;
            var status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
            if(status == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff88ff'}}) == ERR_NO_PATH) {
                    creep.say("TrafficJam");
                }
            }
            else if(status == ERR_NOT_ENOUGH_RESOURCES) {
                creep.memory.target_id = '';
            }
            else if(status == ERR_INVALID_TARGET) {
                var status = creep.harvest(target);
                if(status == ERR_NOT_IN_RANGE || status == ERR_NOT_ENOUGH_RESOURCES) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff88ff'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                }
            }
            else if(status != OK) {
                creep.say('???');
            }
        }
    }
};

module.exports = roleBuilder;
