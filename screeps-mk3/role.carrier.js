
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
    let storage = null, _storage_list = [];
    for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
        let _s = Game.getObjectById(_s_id);
        _storage_list.push(_s);
    }
    if(_storage_list.length > 0) {
        storage = _storage_list[Math.floor(Math.random() * 1000) % _storage_list.length];
    }
    let target = Game.getObjectById(creep.memory.target_id);
    if(creep.memory.status == "withdraw" && target != null && target.store != null && target.store[creep.memory.type] < creep.store.getCapacity() - _.sum(creep.store)) {
        // target has no enough resource
        target = null;
        creep.memory.type = null;
    }
    if(creep.memory.status == "withdraw" && (creep.memory.type == null)) {
        let type_list = [];
        let energy_carrier_count = 0
        for (let carrier_name of Memory.room_dict[creep.memory.main_room].creep["carrier"].name_list) {
            let _type = Memory.creeps[carrier_name].type;
            if(_type) {
                type_list.push(_type);
            }
            if(Memory.creeps[carrier_name].type === RESOURCE_ENERGY) {
                energy_carrier_count += 1;
            }
        }
        if (energy_carrier_count < Memory.room_dict[creep.memory.main_room].container_list.length - 1) {
            creep.memory.type = RESOURCE_ENERGY;
        }
        else {
            for (let room_name of Memory.main_room_list) {
                if (room_name === creep.memory.main_room) {
                    let room_memory = Memory.room_dict[room_name];
                    for (let mineral_id in room_memory.mineral) {
                        if (room_memory.mineral[mineral_id].assigned_miner != null) {
                            let mineral_type = room_memory.mineral[mineral_id].type;
                            let container = Game.getObjectById(room_memory.mineral[mineral_id].container);
                            if (!type_list.includes(mineral_type)
                                && storage.store[mineral_type] < storage.store.getCapacity() * STORAGE_THRESHOLD[mineral_type]
                                && container.store[mineral_type] > creep.store.getCapacity() - _.sum(creep.store)
                            ) {
                                creep.memory.type = mineral_type;
                                break;
                            }
                        }
                    }
                    if(creep.memory.type) {
                        break;
                    }
                }
            }
            if (creep.memory.type == null) {
                creep.memory.type = RESOURCE_ENERGY;
            }
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
        if(creep.memory.type === RESOURCE_ENERGY) {
            if(!target) {
                let targets = global_find.find(FIND_TOMBSTONES, {
                        filter: (target) =>
                            target.creep.store[RESOURCE_ENERGY] > 0
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
            if(!target) {
                target = global_find.find_container_with_energy(creep.memory.main_room, creep.name, creep.carryCapacity - creep.carry.energy);
                if(target) {
                    creep.memory.target_id = target.id;
                }
            }
            if(!target) {
                if(Memory.room_dict[creep.memory.main_room].storage_list.length > 0
                    && Memory.room_dict[creep.memory.main_room].creep.refueler.name_list.length === 0
                ) {
                    if(storage != null) {
                        target = storage;
                    }
                }
            }
            if(!target) {
                creep.say('NoEnergy');
            }
            else {
                creep.memory.target_id = target.id;
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
            let mineral_info = Memory.room_dict[creep.memory.main_room].mineral;
            for(let i in mineral_info) {
                let container = Game.getObjectById(mineral_info[i].container);
                if(container != null) {
                    creep.memory.target_id = container.id;
                    let withdraw_status = creep.withdraw(container, creep.memory.type, creep.store.getCapacity() - creep.store[creep.memory.type]);
                    switch(withdraw_status) {
                        case OK:
                            break;
                        case ERR_NOT_IN_RANGE:
                            path_handler.find(creep, container, 1, 3);
                            break;
                        default:
                            console.log(creep.name, "withdraw", withdraw_status);
                            creep.say(withdraw_status);
                            break;
                    }
                    break;
                }
            }
        }
    }
    else if(creep.memory.status === "transfer" ) {
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
                        console.log(creep.name, "transfer", transfer_status);
                        creep.say(transfer_status);
                }
            }
            else {
                creep.say("Idle");
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
    }
};

module.exports = role_carrier;
