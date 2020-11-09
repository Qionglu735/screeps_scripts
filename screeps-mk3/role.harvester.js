
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let role_harvester = function(creep) {
    if(creep.memory.status == null || !["harvest", "transfer", "build"].includes(creep.memory.status)) {
        creep.memory.status = "harvest";
    }
    if(creep.memory.status === "harvest" && creep.carry.energy === creep.carryCapacity) {
        creep.memory.status = "transfer";
        creep.memory.target_id = null;
        creep.say("Transfer");
    }
    else if(creep.memory.status !== "harvest" && creep.carry.energy === 0) {
        creep.memory.status = "harvest";
        creep.memory.target_id = null;
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
                        break;
                    case ERR_NOT_IN_RANGE:
                        path_handler.find(creep, target, 1, 3);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                    case ERR_INVALID_TARGET:
                        creep.memory.target_id = null;
                        break;
                    default:
                        console.log(creep.name, "withdraw", withdraw_status);
                        creep.say(withdraw_status);
                }
            }
            else {
                creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
            }
        }
        else {
            let target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                let targets = creep.room.find(FIND_SOURCES);
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
            if(target) {
                let harvest_status = creep.harvest(target);
                switch(harvest_status) {
                    case OK:
                        break;
                    case ERR_NOT_IN_RANGE:
                        path_handler.find(creep, target, 1, 3);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.target_id = "";
                        break;
                    default:
                        console.log(creep.name, "harvest", harvest_status);
                        creep.say(harvest_status);
                }
            }
        }
    }
    else if(creep.memory.status === "transfer") {
        let target = Game.getObjectById(creep.memory.target_id);
        if(target && target.energy === target.energyCapacity) {
            creep.memory.target_id = null;
            target = null;
        }
        if(!target) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) =>
                    target.structureType === STRUCTURE_EXTENSION && target.energy < target.energyCapacity});
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) =>
                    target.structureType === STRUCTURE_SPAWN && target.energy < target.energyCapacity});
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (target) =>
                    target.structureType === STRUCTURE_TOWER && target.energy < target.energyCapacity});
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = creep.room.find(FIND_STRUCTURES, {
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
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                case ERR_INVALID_TARGET:
                    creep.memory.target_id = null;
                    break;
                default:
                    console.log(creep.name, "transfer", transfer_status);
                    creep.say(transfer_status);
            }
        }
        else {
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
            creep.memory.target_id = null;
        }
        if(!target) {
            let targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_EXTENSION});
            if(targets != null && targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_CONTAINER});
            if(targets != null && targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_TOWER});
            if(targets != null && targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let targets = global_find.find_by_filter(FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.hits < structure.hitsMax * 0.95
                    && structure.structureType !== STRUCTURE_WALL});
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        // if(!target) {
        //    let targets = creep.room.find(FIND_STRUCTURES, {
        //                                    filter: (structure) =>
        //                                        structure.structureType == STRUCTURE_WALL
        //                                        && structure.hits < creep.room.controller.progressTotal});
        //    if(targets.length > 0) {
        //        target = targets[parseInt(Math.random() * 1000) % targets.length];
        //    }
        // }
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
                        case ERR_INVALID_TARGET:
                            creep.memory.status = "harvest"
                            creep.memory.target_id = null;
                            break;
                        default:
                            console.log(creep.name, "build", build_status);
                            creep.say(build_status)
                    }
                    break;
                default:
                    console.log(creep.name, "repair", repair_status);
                    creep.say(repair_status);
            }
        }
        else {
            creep.memory.status = "harvest";
            creep.say("Idle");
        }
    }
};

module.exports = role_harvester;
