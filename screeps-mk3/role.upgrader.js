
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
	    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
            var pos = new RoomPosition(creep.memory.path_list[0].x,
                                       creep.memory.path_list[0].y,
                                       creep.memory.path_list[0].roomName);
            var move_status = creep.moveTo(pos);
            switch(move_status) {
                case OK:
                    creep.memory.path_list.shift();
                    break;
                case ERR_TIRED:
                    break;
                case ERR_NO_PATH:
                    creep.memory.path_list = null;
                    break;
                default:
                    creep.say(move_status);
            }
        }
        else {
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
                    switch(status) {
                        case OK:
                        case ERR_TIRED:
                            break;
                        case ERR_NOT_IN_RANGE:
                            find_path_and_move.find(creep, target, 1, 3);
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            creep.memory.target_id = "";
                            break;
                        default:
                            creep.say(harvest_status);
                    }
                }
                else {
                    creep.moveTo(Game.flags['UpgraderPark'], {visualizePathStyle: {stroke: '#88ffff'}});
                }
            }
            else {
                var upgrade_status = creep.upgradeController(creep.room.controller);
                switch(upgrade_status) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        find_path_and_move.find(creep, creep.room.controller, 1, 3);
                        break;
                    default:
                        creep.say(upgrade_status);
                }
            }
        }
	}
};

module.exports = roleUpgrader;
