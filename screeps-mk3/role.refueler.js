
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
        // console.log(creep.name, "withdraw", Game.cpu.getUsed() - cpu)
    }
    else if(creep.memory.status === "transfer"){
        // let cpu = Game.cpu.getUsed();
        if(target != null && target.store[RESOURCE_ENERGY] === target.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.target_id = null;
            target = null;
        }
        if(target == null) {
            target = global_find.find_structure_need_energy(creep);
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
        // console.log(creep.name, "transfer f", Game.cpu.getUsed() - cpu)
    }
};

module.exports = role_refueler;
