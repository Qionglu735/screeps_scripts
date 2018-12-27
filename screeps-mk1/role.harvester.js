
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.memory.target_id = '';
            creep.say('Harvest');
        }
        else if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.memory.target_id = '';
            creep.say('Transfer');
        }
	    if(creep.memory.harvesting) {
            if(creep.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Miner'}).length > 0 &&
                    creep.room.find(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_CONTAINER}).length > 0) {
                var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
                if(!target) {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                                                    filter: (target)=>target.structureType == STRUCTURE_CONTAINER &&
                                                    target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                    if(targets.length > 0) {
                        target = targets[parseInt(Math.random() * 1000) % targets.length];
                    }
                }
                if(target) {
                    creep.memory.target_id = target.id;
                    var status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
                    if(status == ERR_NOT_IN_RANGE) {
                        if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                            creep.say('TrafficJam');
                        }
                    }
                    else if(status == ERR_NOT_ENOUGH_RESOURCES) {
                        creep.memory.target_id = '';
                    }
                }
                else {
                    creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
                }
            }
            else {
                var target = creep.room.find(FIND_SOURCES, {filter: (target) => target.id == creep.memory.target_id})[0];
                if(!target) {
                    var targets = creep.room.find(FIND_SOURCES);
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
                var status = creep.harvest(target);
                if( status== ERR_NOT_IN_RANGE || status == ERR_NOT_ENOUGH_RESOURCES) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                }
            }
        }
        else {
            var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    (target.structureType == STRUCTURE_SPAWN || 
                                                    target.structureType == STRUCTURE_EXTENSION) &&
                                                    target.energy < target.energyCapacity});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                targets = creep.room.find(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType == STRUCTURE_TOWER &&
                                                target.energy < target.energyCapacity});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(target) {
                var status = creep.transfer(target, RESOURCE_ENERGY);
                if(status == ERR_FULL) {
                    creep.memory.target_id = '';
                }
                else if(status == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                } 
            }
            else {
                creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
            }
        }
	}
};

module.exports = roleHarvester;
