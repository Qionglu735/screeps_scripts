
let path_handler = require("tool.path_handler");

let roleMiner = function (creep) {
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
                let source = Game.getObjectById(creep.memory.target_id);
                if(source) {
                    creep.harvest(source);
                }
                else {
                    creep.say("No Source");
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

module.exports = roleMiner;
