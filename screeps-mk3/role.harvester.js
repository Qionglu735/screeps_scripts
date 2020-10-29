
let path_handler = require("tool.path_handler");
let global_find = require("tool.global_find");

let roleHarvester = function(creep) {
    if(creep.memory.status == null) {
        creep.memory.status = "harvest";  // harvest, transfer, build
    }
    if(creep.memory.status === "harvest" && creep.carry.energy === creep.carryCapacity) {
        creep.memory.status = "transfer";
        creep.memory.target_id = "";
        creep.say("Transfer");
    }
    else if(creep.memory.status !== "harvest" && creep.carry.energy === 0) {
        creep.memory.status = "harvest";
        creep.memory.target_id = "";
        creep.say("Harvest");
    }
    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.status === "harvest") {
        if(Memory.my_spawn["Spawn1"].creep.miner.name_list.length > 0
                && Memory.my_spawn["Spawn1"].container_list.length > 0) {
            let target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                target = global_find.find_container_with_energy("room", creep.room.name,
                    creep.carryCapacity - creep.carry.energy, 1);
            }
            if(target) {
                creep.memory.target_id = target.id;
                let withdraw_status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
                switch(withdraw_status) {
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
                        creep.say(withdraw_status);
                }
            }
            else {
                creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
            }
        }
        else {
            let target = creep.room.find(FIND_SOURCES, {
                filter: (target) => target.id === creep.memory.target_id})[0];
            if(!target) {
                let targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
            if(target) {
                let harvest_status = creep.harvest(target);
                switch(harvest_status) {
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
                        creep.say(harvest_status);
                }
            }
        }
    }
    else if(creep.memory.status === "transfer") {
        let target = creep.room.find(FIND_STRUCTURES, {
            filter: (target) => target.id === creep.memory.target_id})[0];
        if(target && target.energy === target.energyCapacity) {
            creep.memory.target_id = '';
            target = null;
        }
        if(!target) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) =>
                    (target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_EXTENSION)
                    && target.energy < target.energyCapacity});
            if(targets.length > 0) {
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) =>
                    target.structureType === STRUCTURE_TOWER &&
                    target.energy < target.energyCapacity});
            if(targets.length > 0) {
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (target) =>
                        target.structureType === STRUCTURE_STORAGE
                        && target.store[RESOURCE_ENERGY] < target.storeCapacity
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
                case ERR_TIRED:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                default:
                    creep.say(transfer_status);
            }
        }
        else {
//                creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
            creep.memory.status = "build";
            creep.say("Build");
        }
    }
    else if(creep.memory.status === "build") {
        let target = Game.getObjectById(creep.memory.target_id);
        if(target && target.hits
            && (target.hits === target.hitsMax
                || target.structureType === STRUCTURE_WALL && target.hits < creep.room.controller.progressTotal)) {
            target = null;
            creep.memory.target_id = '';
        }
        if(!target) {
            let targets = global_find.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.hits < structure.hitsMax * 0.95
                    && structure.structureType !== STRUCTURE_WALL});
            if(targets.length > 0) {
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
//            if(!target) {
//                let targets = creep.room.find(FIND_STRUCTURES, {
//                                                filter: (structure) =>
//                                                    structure.structureType == STRUCTURE_WALL
//                                                    && structure.hits < creep.room.controller.progressTotal});
//                if(targets.length > 0) {
//                    target = targets[parseInt(Math.random() * 1000) % targets.length];
//                }
//            }
        if(target) {
            let repair_status = creep.repair(target);
            switch(repair_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                case ERR_INVALID_TARGET:
                    let build_status = creep.build(target);
                    switch(build_status) {
                        case OK:
                            break;
                        case ERR_NOT_IN_RANGE:
                            path_handler.find(creep, target, 1, 3);
                            break;
                        default:
                            creep.say(build_status)
                    }
                    break;
                default:
                    creep.say(transfer_status);
            }
        }
        else {
            creep.memory.status = "harvest";
            creep.say("Harvest");
        }
    }
};

module.exports = roleHarvester;
