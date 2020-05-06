
var find_path_and_move = require("tool.find_path_and_move");

var roleMiner = {
    run: function(creep) {
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
        else if(creep.memory.target_id != null) {
            var container = Game.getObjectById(creep.memory.container_id);
            if(container != null) {
                if(!creep.pos.isEqualTo(container.pos)) {
                    find_path_and_move.find(creep, container, 0, 3)
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
                    var source = Game.getObjectById(creep.memory.target_id);
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
    }
};

module.exports = roleMiner;