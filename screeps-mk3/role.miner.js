
var find_path_and_move = require("tool.find_path_and_move");

var roleMiner = {
    run: function(creep) {
        if(creep.memory.target_id == null) {
//            var targetPos = new RoomPosition(creep.memory.targetPos.x, creep.memory.targetPos.y, creep.memory.targetPos.roomName);
            var container = Game.getObjectById(creep.memory.container_id);
            if(container != null) {
                if(!creep.pos.isEqualTo(container.pos)) {
                    find_path_and_move.find(creep, container.pos, 3)
                }
                else if(container.progress != null && creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.build(container);
                }
                else if(container.hits < container.hitsMax && creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.repair(container);
                }
                else if(_.sum(container.store) == container.storeCapacity
                        && _.sum(creep.carry) == creep.carryCapacity) {
                    creep.say("Full");
                }
                else {
                    var source = Game.getObjectById(creep.memory.source_id);
                    if(source) {
                        creep.harvest(source);
                    }
                    else {
                        creep.say("No Source");
                    }
                }
            }
            else {
                creep.say("No Container");
            }
        }
        else{
            creep.say("Idle");
        }
    }
};

module.exports = roleMiner;