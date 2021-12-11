
let path_handler = require("tool.path_handler");

let role_upgrader = function(creep) {
    if(creep.memory.status == null || !["withdraw", "upgrade"].includes(creep.memory.status)) {
        creep.memory.status = "withdraw";
    }
    else if(creep.memory.status === "withdraw" && creep.carry.energy === creep.carryCapacity) {
        creep.memory.status = "upgrade";
        creep.memory.target_id = null;
        creep.say("Upgrade");
    }
    else if(creep.memory.status === "upgrade" && creep.carry.energy === 0) {
        creep.memory.status = "withdraw";
        creep.memory.target_id = null;
        creep.say("Withdraw");
    }
    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else {
        if(creep.memory.status === "withdraw") {
            let target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                let main_room_memory = Memory.room_dict[creep.memory.main_room]
                let link_controller = Game.getObjectById(main_room_memory.link_controller);
                if(link_controller != null && link_controller.store[RESOURCE_ENERGY] > 0) {
                    target = link_controller;
                }
            }
            if(!target) {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType === STRUCTURE_STORAGE
                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                let targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType === STRUCTURE_CONTAINER
                        && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy});
                if(targets.length > 0) {
                    target = targets[Math.floor(Math.random() * 1000) % targets.length];
                }
            }
            if(!target) {
                let targets = creep.room.find(FIND_SOURCES);
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
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
                        break;
                    case ERR_NOT_IN_RANGE:
                        path_handler.find(creep, target, 1, 3);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.target_id = null;
                        break;
                    default:
                        console.log(creep.name, "harvest/withdraw", status);
                        creep.say(status);
                }
            }
            else {
                creep.say("No Energy")
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
                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.memory.status = "withdraw";
                    creep.memory.target_id = null;
                    break;
                default:
                    console.log(creep.name, "upgrade", upgrade_status);
                    creep.say(upgrade_status);
            }
        }
    }
};

module.exports = role_upgrader;
