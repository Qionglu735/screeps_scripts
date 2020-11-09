
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let role_carrier = function(creep) {
    if(creep.memory.status == null || !["withdraw", "transfer"].includes(creep.memory.status)) {
        creep.memory.status = "withdraw";
    }
    if(creep.memory.status === "transfer" && creep.carry.energy === 0) {
        creep.memory.status = "withdraw";
        creep.memory.target_id = null;
        creep.say('Withdraw');
    }
    else if(creep.memory.status === "withdraw" && creep.carry.energy === creep.carryCapacity) {
        creep.memory.status = "transfer";
        creep.memory.target_id = null;
        creep.say('Transfer');
    }
    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.status === "withdraw") {
        let target = Game.getObjectById(creep.memory.target_id);
        if(!target) {
            let targets = global_find.find_by_filter(FIND_TOMBSTONES, {
                                            filter: (target) =>
                                                target.creep.carry["RESOURCE_ENERGY"] > 0
                                                && 5 <= target.pos.x && target.pos.x <= 45
                                                && 5 <= target.pos.y && target.pos.y <= 45
                                            }
                                        );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_DROPPED_RESOURCES, {
                                            filter: (target) =>
                                                target.resourceType === RESOURCE_ENERGY
                                                && 5 <= target.pos.x && target.pos.x <= 45
                                                && 5 <= target.pos.y && target.pos.y <= 45
                                            }
                                        );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType === STRUCTURE_CONTAINER
                                                && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy
                                            }
                                        );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType === STRUCTURE_CONTAINER
                                                && target.store[RESOURCE_ENERGY] > 0
                                            }
                                        );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                target.structureType === STRUCTURE_STORAGE
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
            let withdraw_status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
            switch(withdraw_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.memory.target_id = null;
                    break;
                case ERR_INVALID_TARGET:
                    let pickup_status = creep.pickup(target);
                    switch(pickup_status) {
                        case OK:
                            break
                        case ERR_NOT_IN_RANGE:
                            path_handler.find(creep, target, 1, 3);
                            break;
                        default:
                            console.log(creep.name, "pickup", pickup_status);
                            creep.say(pickup_status);
                    }
                    break;
                default:
                    console.log(creep.name, "withdraw", withdraw_status);
                    creep.say(withdraw_status);
            }
        }
    }
    else {
        let target = Game.getObjectById(creep.memory.target_id);
        if(target && target.energy === target.energyCapacity) {
            creep.memory.target_id = null;
            target = null;
        }
        if(!target && Memory.my_spawn["Spawn1"].creep.refueler.name_list.length === 0) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                            filter: (target) =>
                                                (target.structureType === STRUCTURE_EXTENSION
                                                || target.structureType === STRUCTURE_SPAWN)
                                                && target.energy < target.energyCapacity
                                            }
                                        );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target && Memory.my_spawn["Spawn1"].creep.refueler.name_list.length === 0) {
            targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                        filter: (target) =>
                                            target.structureType === STRUCTURE_TOWER
                                            && target.energy < target.energyCapacity
                                        }
                                    );
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                                        filter: (target) =>
                                            target.structureType === STRUCTURE_STORAGE
                                            && target.store[RESOURCE_ENERGY] < target.storeCapacity / 2
                                        }
                                    );
            if(targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(target) {
            let transfer_status = creep.transfer(target, RESOURCE_ENERGY);
            switch(transfer_status) {
                case OK:
                    break;
                case ERR_FULL:
                    creep.memory.target_id = null;
                    break
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                default:
                    console.log(creep.name, "transfer", transfer_status);
                    creep.say(transfer_status);
            }
        }
        else {
            creep.say("Idle");
        }
    }
};

module.exports = role_carrier;
