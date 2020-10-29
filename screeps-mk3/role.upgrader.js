
let path_handler = require("tool.path_handler");

let roleUpgrader = function(creep) {
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
        path_handler.move(creep);
    }
    else {
        if(creep.memory.status == "withdraw") {
            let target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType == STRUCTURE_STORAGE
                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType == STRUCTURE_CONTAINER
                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[parseInt(Math.random() * 1000) % targets.length];
                }
            }
            if(!target) {
                let targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
            }
            if(target) {
                creep.memory.target_id = target.id;
                let status = null;
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
                        path_handler.find(creep, target, 1, 3);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.target_id = "";
                        break;
                    default:
                        creep.say(status);
                }
            }
            else {
                creep.moveTo(Game.flags['UpgraderPark'], {visualizePathStyle: {stroke: '#88ffff'}});
            }
        }
        else {
            let upgrade_status = creep.upgradeController(creep.room.controller);
            switch(upgrade_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, creep.room.controller, 1, 3);
                    break;
                default:
                    creep.say(upgrade_status);
            }
        }
    }
};

module.exports = roleUpgrader;
