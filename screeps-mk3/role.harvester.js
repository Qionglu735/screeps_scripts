
var find_path_and_move = require("tool.find_path_and_move");
var global_find = require("tool.global_find");

var roleHarvester = function(creep) {
    if(creep.memory.status == null) {
        creep.memory.status = "harvest";  // harvest, transfer, build
    }
    if(creep.memory.status == "harvest" && creep.carry.energy == creep.carryCapacity) {
        creep.memory.status = "transfer";
        creep.memory.target_id = "";
        creep.say("Transfer");
    }
    else if(creep.memory.status != "harvest" && creep.carry.energy == 0) {
        creep.memory.status = "harvest";
        creep.memory.target_id = "";
        creep.say("Harvest");
    }
    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        var pos = new RoomPosition(creep.memory.path_list[0].x,
                                   creep.memory.path_list[0].y,
                                   creep.memory.path_list[0].roomName);
        var move_status = creep.moveTo(pos);
        switch(move_status) {
            case OK:
            case ERR_TIRED:
                creep.memory.path_list.shift();
                break;
            case ERR_NO_PATH:
                creep.memory.path_list = null;
                break;
            default:
                creep.say(move_status);
        }
    }
    else if(creep.memory.status == "harvest") {
        if(Memory.CreepStat.Miner.name_list.length > 0
                && Memory.Room[creep.room.name].container_list.length > 0) {
            var target = Game.getObjectById(creep.memory.target_id);
            if(!target) {
                var target = global_find.find_container_with_energy("room", creep.room.name,
                                                        creep.carryCapacity - creep.carry.energy, 1);
            }
            if(target) {
                creep.memory.target_id = target.id;
                var withdraw_status = creep.withdraw(target, RESOURCE_ENERGY,
                                                     creep.carryCapacity - creep.carry.energy);
                switch(withdraw_status) {
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
                        creep.say(withdraw_status);
                }
            }
            else {
                creep.moveTo(Game.flags['HarvesterPark'], {visualizePathStyle: {stroke: '#ffff88'}});
            }
        }
        else {
            var target = creep.room.find(FIND_SOURCES, {
                filter: (target) => target.id == creep.memory.target_id})[0];
            if(!target) {
                var targets = creep.room.find(FIND_SOURCES);
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
            if(target) {
                var harvest_status = creep.harvest(target);
                switch(harvest_status) {
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
        }
    }
    else if(creep.memory.status == "transfer") {
        var target = creep.room.find(FIND_STRUCTURES, {
            filter: (target) => target.id == creep.memory.target_id})[0];
        if(target && target.energy == target.energyCapacity) {
            creep.memory.target_id = '';
            target = null;
        }
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
        if(!target) {
            targets = creep.room.find(FIND_STRUCTURES, {
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
            var transfer_status = creep.transfer(target, RESOURCE_ENERGY);
            switch(transfer_status) {
                case OK:
                case ERR_TIRED:
                    break;
                case ERR_NOT_IN_RANGE:
                    find_path_and_move.find(creep, target, 1, 3);
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
    else if(creep.memory.status == "build") {
        var target = Game.getObjectById(creep.memory.target_id);
        if(target && target.hits
            && (target.hits == target.hitsMax
            || target.structureType == STRUCTURE_WALL && target.hits < creep.room.controller.progressTotal)) {
            target = null;
            creep.memory.target_id = '';
        }
        if(!target) {
            var targets = global_find.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            var targets = global_find.find(FIND_STRUCTURES, {
                                            filter: (structure) =>
                                                structure.hits < structure.hitsMax * 0.95
                                                && structure.structureType != STRUCTURE_WALL});
            if(targets.length > 0) {
                target = targets[parseInt(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
//            if(!target) {
//                var targets = creep.room.find(FIND_STRUCTURES, {
//                                                filter: (structure) =>
//                                                    structure.structureType == STRUCTURE_WALL
//                                                    && structure.hits < creep.room.controller.progressTotal});
//                if(targets.length > 0) {
//                    target = targets[parseInt(Math.random() * 1000) % targets.length];
//                }
//            }
        if(target) {
            var repair_status = creep.repair(target);
            switch(repair_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    find_path_and_move.find(creep, target, 1, 3);
                    break;
                case ERR_INVALID_TARGET:
                    var build_status = creep.build(target);
                    switch(build_status) {
                        case OK:
                            break;
                        case ERR_NOT_IN_RANGE:
                            find_path_and_move.find(creep, target, 1, 3);
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

var find_container_with_energy = function(room_name, min_energy=0, random_choose=0) {
    var container_list = Memory.Room[room_name].container_list;
    var target_list = [];
    for(var i in container_list) {
        var container = Game.getObjectById(container_list[i])
        if(container != null && container.progress == null) {
            if(container.store[RESOURCE_ENERGY] > min_energy) {
                target_list.push(container);
            }
        }
    }
    if(target_list === 0) {  // not found
        return null;
    }
    else if(random_choose === 0) {  // return the first one
        return target_list[0];
    }
    else if(random_choose === 1) { // return a random one
        return target_list[parseInt(Math.random() * 1000) % target_list.length];
    }
};

module.exports = roleHarvester;
