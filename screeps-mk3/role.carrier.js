
let global_find = require("tool.global_find");
let path_handler = require("tool.path_handler");

let role_carrier = function(creep) {
    if(creep.memory.status == null || !["withdraw", "transfer"].includes(creep.memory.status)) {
        creep.memory.status = "withdraw";
    }
    if(creep.memory.status === "transfer" && _.sum(creep.store) === 0) {
        creep.memory.status = "withdraw";
        creep.memory.target_id = null;
        creep.memory.type = null;
        creep.say("Withdraw");
    }
    else if(creep.memory.status === "withdraw" && _.sum(creep.store) === creep.store.getCapacity()) {
        creep.memory.status = "transfer";
        global_find.remove_container_assign_record(creep.memory.target_id, creep.name);
        creep.memory.target_id = null;
        creep.say("Transfer");
    }
    let target = Game.getObjectById(creep.memory.target_id);
    if (creep.memory.status == "withdraw") {
        if (target == null || target.store == null || target.store[creep.memory.type] === 0) {
            // target not exist, or has no enough resource
            global_find.remove_container_assign_record(creep.memory.target_id, creep.name);
            creep.memory.target_id = null;
            if (creep.store.getFreeCapacity() != creep.store.getCapacity()) {
                creep.memory.status = "transfer";
            }
            else {
                creep.memory.type = null;
            }
        }
    }
    let storage = null, _storage_list = [];
    for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
        let _s = Game.getObjectById(_s_id);
        _storage_list.push(_s);
    }
    if(_storage_list.length > 0) {
        storage = _storage_list[Math.floor(Math.random() * 1000) % _storage_list.length];
    }
    if(creep.memory.status == "withdraw" && creep.memory.type == null) {
        let main_room_memory = Memory.room_dict[creep.memory.main_room];
        let type_list = main_room_memory.creep.carrier.type_list;
        if (type_list.filter(t => t === RESOURCE_ENERGY).length < main_room_memory.creep.carrier.energy_carrier_max) {
            creep.memory.type = RESOURCE_ENERGY;
        }
        else {
            for (let mineral_id in main_room_memory.mineral) {
                if (main_room_memory.mineral[mineral_id].container != null) {
                    let mineral_type = main_room_memory.mineral[mineral_id].type;
                    let container = Game.getObjectById(main_room_memory.mineral[mineral_id].container);
                    if (type_list.includes(mineral_type) == false
                        && storage.store[mineral_type] < storage.store.getCapacity() * STORAGE_THRESHOLD[mineral_type]
                        && container.store[mineral_type] >= creep.store.getFreeCapacity()
                    ) {
                        creep.memory.type = mineral_type;
                        break;
                    }
                }
            }
        }
        if (creep.memory.type == null) {
            creep.memory.type = RESOURCE_ENERGY;
        }
    }
    if(creep.memory.status == "transfer" && target != null && target.store != null && (
        creep.memory.type == RESOURCE_ENERGY && target.store[creep.memory.type] == target.store.getCapacity(creep.memory.type)
        || creep.memory.type != RESOURCE_ENERGY && target.store[creep.memory.type] >= target.store.getCapacity(creep.memory.type) * STORAGE_THRESHOLD[creep.memory.type]
    )) {
        // target has no enough capacity
        target = null;
    }
    if(target != null && creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.status === "withdraw") {
        // if (!target) {
        //     let targets = global_find.find(FIND_TOMBSTONES, {
        //             filter: (target) =>
        //                 target.store[creep.memory.type] > 0
        //                 && 5 <= target.pos.x && target.pos.x <= 45
        //                 && 5 <= target.pos.y && target.pos.y <= 45
        //         }
        //     );
        //     if (targets.length > 0) {
        //         target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //     }
        // }
        // if (!target) {
        //     let targets = global_find.find(FIND_DROPPED_RESOURCES, {
        //             filter: (target) =>
        //                 target.resourceType === creep.memory.type
        //                 && 5 <= target.pos.x && target.pos.x <= 45
        //                 && 5 <= target.pos.y && target.pos.y <= 45
        //         }
        //     );
        //     if (targets.length > 0) {
        //         target = targets[Math.floor(Math.random() * 1000) % targets.length];
        //     }
        // }
        if (creep.memory.type === RESOURCE_ENERGY) {
            if (!target) {
                target = global_find.find_container_with_energy(creep.memory.main_room, creep.name, creep.store.getFreeCapacity());
            }
            if (!target) {
                target = global_find.find_container_with_energy(creep.memory.main_room, creep.name, 1);
            }
            if (!target) {
                if (Memory.room_dict[creep.memory.main_room].storage_list.length > 0
                    && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0
                ) {
                    if (storage != null) {
                        target = storage;
                    }
                }
            }
        }
        else {
            if (!target) {
                let mineral_info = Memory.room_dict[creep.memory.main_room].mineral;
                for (let i in mineral_info) {
                    let container = Game.getObjectById(mineral_info[i].container);
                    if (container != null) {
                        target = container;
                        break;
                    }
                }
            }
        }
        if (!target) {
            creep.say("No Target");
            if (Game.flags["IdlePark"] && creep.pos.getRangeTo(Game.flags["IdlePark"].pos) > 1) {
                creep.moveTo(Game.flags["IdlePark"], {visualizePathStyle: {stroke: "#ff88ff"}});
            }
        }
        else {
            creep.memory.target_id = target.id;
            let withdraw_status = creep.withdraw(target, creep.memory.type, creep.store.getFreeCapacity());
            switch (withdraw_status) {
                case OK:
                    global_find.remove_container_assign_record(creep.memory.target_id, creep.name);
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    let _withdraw_status = creep.withdraw(target, creep.memory.type, target.store[creep.memory.type]);
                    switch (_withdraw_status) {
                        case OK:
                            global_find.remove_container_assign_record(creep.memory.target_id, creep.name);
                            break;
                        case ERR_NOT_IN_RANGE:
                            path_handler.find(creep, target, 1, 3);
                            break;
                        default:
                            console.log(creep.name, "withdraw", _withdraw_status);
                            creep.say(_withdraw_status);
                    }
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
                            break;
                    }
                    break;
                default:
                    console.log(creep.name, "withdraw", withdraw_status);
                    creep.say(withdraw_status);
            }
        }
    }
    else if(creep.memory.status === "transfer") {
        if(creep.memory.type === RESOURCE_ENERGY) {
            if(target != null && target.store[RESOURCE_ENERGY] === target.store.getCapacity(RESOURCE_ENERGY)) {
                creep.memory.target_id = null;
                target = null;
            }
            if(!target && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0) {
                target = global_find.find_structure_need_energy(creep);
            }
            if(!target && storage != null) {
                if(storage.store[RESOURCE_ENERGY] < storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY]) {
                    target = storage;
                }
            }
            if(target) {
                creep.memory.target_id = target.id;
                let transfer_status = creep.transfer(target, RESOURCE_ENERGY);
                switch(transfer_status) {
                    case OK:
                        global_find.remove_transfer_assigned_record(target.id);
                        break;
                    case ERR_FULL:
                        creep.memory.target_id = null;
                        break
                    case ERR_NOT_IN_RANGE:
                        path_handler.find(creep, target, 1, 3);
                        break;
                    default:
                        console.log(creep.name, "transfer", target.pos, transfer_status);
                        creep.say(transfer_status);
                }
            }
            else {
                creep.say("Idle TE");
                if (Game.flags["IdlePark"] && creep.pos.getRangeTo(Game.flags["IdlePark"].pos) > 1) {
                    creep.moveTo(Game.flags["IdlePark"], {visualizePathStyle: {stroke: "#ff88ff"}});
                }
            }
        }
        else {
            if(storage != null && storage.store[creep.memory.type] < storage.store.getCapacity() * STORAGE_THRESHOLD[creep.memory.type]) {
                target = storage;
            }
            if(target) {
                creep.memory.target_id = target.id;
                let transfer_status = creep.transfer(target, creep.memory.type);
                switch(transfer_status) {
                    case OK:
                        global_find.remove_transfer_assigned_record(target.id);
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.target_id = null;
                        creep.memory.type = null;
                        break;
                    case ERR_FULL:
                        creep.memory.target_id = null;
                        creep.memory.type = null;
                        break
                    case ERR_NOT_IN_RANGE:
                        path_handler.find(creep, target, 1, 3);
                        break;
                    default:
                        console.log(creep.name, "transfer", target.pos, transfer_status);
                        creep.say(transfer_status);
                }
            }
            else {
                creep.say("Idle TM");
                if (Game.flags["IdlePark"] && creep.pos.getRangeTo(Game.flags["IdlePark"].pos) > 1) {
                    creep.moveTo(Game.flags["IdlePark"], {visualizePathStyle: {stroke: "#ff88ff"}});
                }
            }
        }
    }
};

module.exports = role_carrier;
