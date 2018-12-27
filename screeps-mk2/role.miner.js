
var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.targetID == -1) {
            var i = 0;
            while(i < Memory.MinePort.length) {
                if(Memory.MineAssigned[i] == false && Memory.MineType[i] == "ENERGY") {
                    break;
                }
                i += 1;
            }
            if(i == Memory.MinePort.length) {
                i = 0;
                while(i < Memory.MinePort.length) {
                    if(Memory.MineAssigned[i] == false && Memory.MineType[i] != "ENERGY") {
                        break;
                    }
                    i += 1;
                }
            }
            if(i < Memory.MinePort.length) {
                creep.memory.targetPos = new RoomPosition(Memory.MinePort[i].x, Memory.MinePort[i].y, Memory.MinePort[i].roomName);
                creep.memory.targetID = i;
                Memory.MineAssigned[i] = true;
            }
        }
        else if(creep.memory.targetID != -1) {
            var targetPos = new RoomPosition(creep.memory.targetPos.x, creep.memory.targetPos.y, creep.memory.targetPos.roomName);
            var container = Game.getObjectById(creep.memory.container_id);
            if(!container) {
                try {
                    var containers = targetPos.lookFor(LOOK_STRUCTURES);
                    if(containers.length > 0 && containers[0].structureType == STRUCTURE_CONTAINER) {
                        container = containers[0];
                        creep.memory.container_id = container.id;
                    }
                }
                catch(e) {
                    if(e.message.indexOf("Could not access room") != -1) {
                        console.log(creep.name, e.message);
                    }
                    else {
                        throw e;
                    }
                }
            }
            if(container) {
                if(!creep.pos.isEqualTo(targetPos)) {
                    if(creep.moveTo(targetPos, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                }
                else if(container.hits < container.hitsMax && creep.carry[RESOURCE_ENERGY] > 0) {
                    creep.repair(container);
                }
                else if(_.sum(container.store) == container.storeCapacity
                        && _.sum(creep.carry) == creep.carryCapacity) {
                    creep.say('Full');
                }
                else {
                    var source = Game.getObjectById(creep.memory.source_id);
                    if(!source) {
                        if(Memory.MineType[creep.memory.targetID] == "ENERGY") {
                            source = creep.pos.findClosestByRange(FIND_SOURCES);
                        }
                        else {
                            source = creep.pos.findClosestByRange(FIND_MINERALS);
                        }
                        creep.memory.source_id = source.id;
                    }
                    creep.harvest(source);
                }
            }
            else {
                creep.say('Container?');
            }
        }
        else{
            creep.say('???');
        }
    }
};

module.exports = roleMiner;