
var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.Withdrawing && creep.carry.energy == 0) {
            creep.memory.Withdrawing = true;
            creep.memory.target_id = '';
            creep.say('Withdraw');
        }
        else if(creep.memory.Withdrawing && creep.carry.energy == creep.carryCapacity) {
            creep.memory.Withdrawing = false;
            creep.memory.target_id = '';
            creep.say('Transfer');
        }
	    if(creep.memory.Withdrawing) {
            //var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            var target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    target.structureType == STRUCTURE_STORAGE
                                                    && target.store[RESOURCE_ENERGY] >= 0});
                if(targets.length > 0) {
                    target = targets[0];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                creep.say('NoEnergy');
            }
            else {
                var status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
                if(status == ERR_NOT_IN_RANGE) {
                    if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                        creep.say('TrafficJam');
                    }
                }
                else if(status == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.say("EnergyLow");
                    creep.memory.target_id = '';
                }
                else if(status == ERR_INVALID_TARGET) {
                    status = creep.pickup(target, {visualizePathStyle: {stroke: '#ffff88'}});
                    if(status == ERR_NOT_IN_RANGE) {
                        if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                            creep.say('TrafficJam');
                        }
                    }
                    else if(status != OK) {
                        creep.say('???');
                    }
                }
                else if(status != OK) {
                    creep.say('???');
                }
            }
        }
        else {
            //var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            var target = Game.getObjectById(creep.memory.target_id);
            if(target && target.energy == target.energyCapacity) {
                creep.memory.target_id = '';
                target = null;
            }
            if(!target) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    (target.structureType == STRUCTURE_EXTENSION
                                                    || target.structureType == STRUCTURE_SPAWN)
                                                    && target.energy < target.energyCapacity
                                                    || target.structureType == STRUCTURE_TOWER
                                                    && target.energy < target.energyCapacity
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(target) {
                var status = creep.transfer(target, RESOURCE_ENERGY);
                if(status == ERR_NOT_IN_RANGE) {
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

module.exports = roleCarrier;
