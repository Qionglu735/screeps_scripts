
let path_handler = require("tool.path_handler");
let global_find = require("tool.global_find");

let role_refueler = function(creep) {
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
    if(target != null && creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.status === "withdraw") {
        let cpu = Game.cpu.getUsed()
        if(!target) {
            let targets = [];
            for(let _s_id of Memory.room_dict[creep.memory.main_room].storage_list) {
                let _s = Game.getObjectById(_s_id);
                if(_s.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry.energy) {
                    targets.push(_s);
                }
            }
            if(targets.length > 0) {
                target = targets[0];
                creep.memory.target_id = target.id;
            }
        }
        if(target) {
            let withdraw_status = creep.withdraw(target, RESOURCE_ENERGY, creep.carryCapacity - creep.carry.energy);
            switch(withdraw_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find(creep, target, 1, 3);
                    break;
                case ERR_NOT_ENOUGH_RESOURCES:
                    creep.say('No Energy');
                    break;
                default:
                    console.log(creep.name, "withdraw", withdraw_status);
                    creep.say(withdraw_status);
            }
        }
        else {
            creep.say('No Energy');
        }
        console.log(creep.name, "withdraw", Game.cpu.getUsed() - cpu)
    }
    else if(creep.memory.status === "transfer"){
        // let cpu = Game.cpu.getUsed();
        if(target != null && target.store[RESOURCE_ENERGY] === target.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.target_id = null;
            target = null;
        }
        // console.log(creep.name, "transfer a", Game.cpu.getUsed() - cpu)
        // if(!target) {
        //     let _spawn = Game.spawns[Memory.room_dict[creep.memory.main_room].spawn_list[0]];
        //     if(_spawn.store[RESOURCE_ENERGY] < _spawn.store.getCapacity(RESOURCE_ENERGY)) {
        //         target = _spawn;
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // console.log(creep.name, "transfer b", Game.cpu.getUsed() - cpu)
        // if(!target) {  // TODO: cost too much cpu, about 1s
        //     let targets = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
        //         filter: (target) =>
        //             (target.structureType === STRUCTURE_EXTENSION
        //             && target.energy < target.energyCapacity)});
        //     if(targets.length > 0) {
        //         target = targets[Game.time % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // console.log(creep.name, "transfer c", Game.cpu.getUsed() - cpu)
        // if(!target) {  // TODO: cost too much cpu, about 1.5s at rcl=5
        //     let targets = [];
        //     for(let _e_id of Memory.room_dict[creep.memory.main_room].extension_list) {
        //         let _e = Game.getObjectById(_e_id);
        //         if(_e.store[RESOURCE_ENERGY] < _e.store.getCapacity(RESOURCE_ENERGY)) {
        //             targets.push(_e);
        //         }
        //     }
        //     if(targets.length > 0) {
        //         target = targets[Game.time % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // console.log(creep.name, "transfer d", Game.cpu.getUsed() - cpu)
        // if(!target) {
        //     let targets = [];
        //     for(let _t_id of Memory.room_dict[creep.memory.main_room].tower_list) {
        //         let _t = Game.getObjectById(_t_id);
        //         if(_t.store[RESOURCE_ENERGY] < _t.store.getCapacity(RESOURCE_ENERGY)) {
        //             targets.push(_t);
        //         }
        //     }
        //     if(targets.length > 0) {
        //         target = targets[Game.time % targets.length];
        //         creep.memory.target_id = target.id;
        //     }
        // }
        // console.log(creep.name, "transfer e", Game.cpu.getUsed() - cpu)
        if(target == null) {
            target = global_find.find_structure_need_energy(creep);
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
        // console.log(creep.name, "transfer f", Game.cpu.getUsed() - cpu)
    }
};

module.exports = role_refueler;
