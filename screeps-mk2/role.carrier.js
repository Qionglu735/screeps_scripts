
var globalFind = require("tool.globalFind");

//X:U:K:L:Z:G:H:O = 10:2:2:2:2:2:15:15

var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.harvesting && creep.carry.energy == 0) {
            creep.memory.harvesting = true;
            creep.memory.target_id = '';
            creep.say('Withdraw');
        }
        else if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
            creep.memory.target_id = '';
            creep.say('Transfer');
        }
	    if(creep.memory.harvesting) {
            //var target = globalFind.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            var target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                var targets = globalFind.find(FIND_TOMBSTONES, {
                                                filter: (target) =>
                                                    target.creep.carry["RESOURCE_ENERGY"] >0
                                                    && 5 <= target.pos.x && target.pos.x <= 45
                                                    && 5 <= target.pos.y && target.pos.y <= 45
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                var targets = globalFind.find(FIND_DROPPED_RESOURCES, {
                                                filter: (target) =>
                                                    target.resourceType == RESOURCE_ENERGY
                                                    && 5 <= target.pos.x && target.pos.x <= 45
                                                    && 5 <= target.pos.y && target.pos.y <= 45
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                var targets = globalFind.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    target.structureType == STRUCTURE_CONTAINER
                                                    && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                var targets = globalFind.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    target.structureType == STRUCTURE_CONTAINER
                                                    && target.store[RESOURCE_ENERGY] > 0
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                var targets = globalFind.find(FIND_STRUCTURES, {
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
                    creep.withdraw(target, RESOURCE_ENERGY, target.store[RESOURCE_ENERGY]);
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
            //var target = globalFind.find(FIND_STRUCTURES, {filter: (target) => target.id == creep.memory.target_id})[0];
            var target = Game.getObjectById(creep.memory.target_id);
            if(target && target.energy == target.energyCapacity) {
                creep.memory.target_id = '';
                target = null;
            }
            if(!target && Memory.RefuelerNum == 0) {
                var targets = globalFind.find(FIND_STRUCTURES, {
                                                filter: (target) =>
                                                    (target.structureType == STRUCTURE_EXTENSION
                                                    || target.structureType == STRUCTURE_SPAWN)
                                                    && target.energy < target.energyCapacity
                                                }
                                            );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target && Memory.RefuelerNum == 0) {
                targets = globalFind.find(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType == STRUCTURE_TOWER
                                                && target.energy < target.energyCapacity
                                            }
                                        );
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                targets = globalFind.find(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType == STRUCTURE_STORAGE
                                                && target.store[RESOURCE_ENERGY] < target.storeCapacity
                                            }
                                        );
                if(targets.length > 0) {
                    target = targets[0];
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
