
let path_handler = require("tool.path_handler");

let role_miner = function (creep) {
    if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(creep.memory.target_id != null) {
        let container = Game.getObjectById(creep.memory.container_id);
        if(container != null) {
            if(!creep.pos.isEqualTo(container.pos)) {
                path_handler.find(creep, container, 0, 3)
            }
            else if(container.progress != null && creep.carry[RESOURCE_ENERGY] > 0) {
                creep.build(container);
            }
            else if(container.hits < container.hitsMax && creep.carry[RESOURCE_ENERGY] > 0) {
                creep.repair(container);
            }
            else if(_.sum(container.store) === container.storeCapacity && _.sum(creep.carry) === creep.carryCapacity) {
                creep.say("Full");
            }
            else {
                let target = Game.getObjectById(creep.memory.target_id);
                if(target.energy == null) {  // is mineral
                    let extractor = Game.getObjectById(creep.memory.extractor_id);
                    if(extractor != null) {
                        if(extractor.progress != null) {
                            creep.say("Wait");
                            console.log(creep.name, "wait for extractor")
                            return;
                        }
                    }
                    else {
                        creep.memory.extractor_id = null;
                        creep.say("No Extractor");
                        console.log(creep.name, "no extractor")
                        return;
                    }
                }
                if(target) {
                    let harvest_status = creep.harvest(target);
                    switch(harvest_status) {
                        case OK:
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            break;
                        case ERR_TIRED:  // The extractor or the deposit is still cooling down
                            break;
                        default:
                            console.log(creep.name, "harvest", harvest_status);
                    }
                }
                else {
                    creep.say("No Target");
                    console.log(creep.name, "no target")
                }
            }
        }
        else {
            creep.memory.container_id = null;
            creep.say("No Container");
        }
    }
    else{
        creep.say("Idle");
    }
};

module.exports = role_miner;
