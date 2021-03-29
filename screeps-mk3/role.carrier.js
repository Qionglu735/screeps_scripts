
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let role_carrier = function(creep) {
    // if(creep.memory.status === "withdraw"
    //     && creep.memory.target_id != null && Game.getObjectById(creep.memory.target_id) != null) {
    //     let obj = Game.getObjectById(creep.memory.target_id)
    //     if(obj.store) {
    //         console.log(creep.name, creep.carry.energy, creep.memory.status, obj.structureType, obj.pos.x, obj.pos.y, obj.room.name, obj.store[RESOURCE_ENERGY])
    //     }
    // }
    // else {
    //     console.log(creep.name, creep.carry.energy, creep.memory.status)
    // }
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
    let target = Game.getObjectById(creep.memory.target_id);
    if(target != null && target.store && target.store["RESOURCE_ENERGY"] < creep.carryCapacity - creep.carry.energy) {
        target = null;
    }
    if(target != null && creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.status === "withdraw") {
        if(!target) {
            let targets = global_find.find(FIND_TOMBSTONES, {
                    filter: (target) =>
                        target.creep.store["RESOURCE_ENERGY"] > 0
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
            let targets = global_find.find(FIND_DROPPED_RESOURCES, {
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
        // if(!target) {
        //     let targets = global_find.find_by_filter(FIND_STRUCTURES, {
        //             filter: (target) =>
        //                 target.structureType === STRUCTURE_CONTAINER
        //                 && target.store[RESOURCE_ENERGY] === target.store.getCapacity[RESOURCE_ENERGY]
        //         }
        //     );
        //     if(targets.length > 0) {
        //         target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // if(!target) {
        //     let targets = global_find.find_by_filter(FIND_STRUCTURES, {
        //             filter: (target) =>
        //                 target.structureType === STRUCTURE_CONTAINER
        //                 && target.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy
        //         }
        //     );
        //     if(targets.length > 0) {
        //
        //         // target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //         target = targets[0];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        if(!target) {
            target = global_find.find_container_with_energy(creep.memory.main_room,
                creep.carryCapacity - creep.carry.energy);
            if(target) {
                creep.memory.target_id = target.id;
            }
        }
        if(!target) {
            if(Memory.room_dict[creep.memory.main_room].storage_list.length > 0) {
                let _t = Game.getObjectById(Memory.room_dict[creep.memory.main_room].storage_list[0]);
                if(_t != null) {
                    target = _t;
                    creep.memory.target_id = target.id;
                }
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
    else if(creep.memory.status === "transfer"){
        if(target != null && target.store[RESOURCE_ENERGY] === target.store.getCapacity[RESOURCE_ENERGY]) {
            creep.memory.target_id = null;
            target = null;
        }
        // if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
        //     let _spawn = Game.spawns["Spawn1"];
        //     if(_spawn.store[RESOURCE_ENERGY] < _spawn.store.getCapacity(RESOURCE_ENERGY)) {
        //         target = _spawn;
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
        //     let targets = [];
        //     for(let _e_id of Memory.room_dict[creep.memory.main_room].extension_list) {
        //         let _e = Game.getObjectById(_e_id);
        //         if(_e.store[RESOURCE_ENERGY] < _e.store.getCapacity(RESOURCE_ENERGY)) {
        //             targets.push(_e);
        //         }
        //     }
        //     if(targets.length > 0) {
        //         target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
        //     let targets = [];
        //     for(let _t_id of Memory.room_dict[creep.memory.main_room].tower_list) {
        //         let _t = Game.getObjectById(_t_id);
        //         if(_t.store[RESOURCE_ENERGY] < _t.store.getCapacity(RESOURCE_ENERGY)) {
        //             targets.push(_t);
        //         }
        //     }
        //     if(targets.length > 0) {
        //         target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
            target = global_find.find_structure_need_energy(creep);
        }
        if(!target) {
            let targets = [];
            for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
                let _s = Game.getObjectById(_s_id);
                if(_s.store[RESOURCE_ENERGY] < _s.store.getCapacity(RESOURCE_ENERGY)) {
                    targets.push(_s);
                }
            }
            if(targets.length > 0) {
                target = targets[Math.floor(Math.random() * 1000) % targets.length];
            }
        }
        if(target) {
            creep.memory.target_id = target.id;
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
