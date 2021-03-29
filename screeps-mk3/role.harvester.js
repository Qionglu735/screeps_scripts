
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let role_harvester = function(creep) {
    if(creep.memory.status == null || !["harvest", "transfer", "build", "upgrade"].includes(creep.memory.status)) {
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
        if(Memory.room_dict[creep.memory.main_room].creep.miner.name_list.length > 0
                && Memory.room_dict[creep.memory.main_room].container_list.length > 0
                && Game.getObjectById(Memory.room_dict[creep.memory.main_room].container_list[0]) != null
                && Game.getObjectById(Memory.room_dict[creep.memory.main_room].container_list[0]).progress == null) {
            let target = Game.getObjectById(creep.memory.target_id);
            if(!target && Memory.room_dict[creep.memory.main_room].creep.carrier.name_list.length > 0) {
                let targets = [];
                for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
                    let _s = Game.getObjectById(_s_id);
                    if(_s.store[RESOURCE_ENERGY] < _s.store.getCapacity(RESOURCE_ENERGY)) {
                        targets.push(_s);
                    }
                }
                if(targets.length > 0) {
                    target = targets[0];
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                target = global_find.find_container_with_energy(creep.memory.main_room,
                    creep.carryCapacity - creep.carry.energy);
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
                creep.say("No Energy");
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
                    case ERR_INVALID_TARGET:
                        creep.memory.target_id = null;
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
        if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
            let _spawn = Game.spawns["Spawn1"];
            if(_spawn.store[RESOURCE_ENERGY] < _spawn.store.getCapacity(RESOURCE_ENERGY)) {
                target = _spawn;
                creep.memory.target_id = target.id;
            }
        }
        if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
            let targets = [];
            for(let _e_id of Memory.room_dict[creep.memory.main_room].extension_list) {
                let _e = Game.getObjectById(_e_id);
                if(_e.store[RESOURCE_ENERGY] < _e.store.getCapacity(RESOURCE_ENERGY)) {
                    targets.push(_e);
                }
            }
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
            let targets = [];
            for(let _t_id of Memory.room_dict[creep.memory.main_room].tower_list) {
                let _t = Game.getObjectById(_t_id);
                if(_t.store[RESOURCE_ENERGY] < _t.store.getCapacity(RESOURCE_ENERGY)) {
                    targets.push(_t);
                }
            }
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
                creep.memory.target_id = target.id;
            }
        }
        if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
            let targets = [];
            for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
                let _s = Game.getObjectById(_s_id);
                if(_s.store[RESOURCE_ENERGY] < _s.store.getCapacity(RESOURCE_ENERGY)) {
                    targets.push(_s);
                }
            }
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
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
            let _target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_EXTENSION});
            if(_target != null) {
                target = _target;
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let _target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_CONTAINER});
            if(_target != null) {
                target = _target;
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            let _target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
                filter: (construction_site) => construction_site.structureType === STRUCTURE_TOWER});
            if(_target != null) {
                target = _target;
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
            let targets = global_find.find(FIND_STRUCTURES, {
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
            creep.memory.status = "upgrade";
            creep.say("Upgrade");
        }
    }
    else if(creep.memory.status === "upgrade"){
        let upgrade_status = creep.upgradeController(Game.rooms[creep.memory.main_room].controller);
        switch(upgrade_status) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                path_handler.find(creep, Game.rooms[creep.memory.main_room].controller, 1, 3);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.status = "harvest";
                creep.memory.target_id = null;
                break;
            default:
                console.log(creep.name, "upgrade", upgrade_status);
                creep.say(upgrade_status);
        }
    }
};

module.exports = role_harvester;
