var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.targetPos) {
            var i = 0;
            while(i < Memory.MinePos.length) {
                if(Memory.MineAssigned[i] == false) {
                    break;
                }
                i += 1;
            }
            if(i < Memory.MinePos.length) {
                creep.memory.targetPos = new RoomPosition(Memory.MinePos[i].x, Memory.MinePos[i].y, Memory.MinePos[i].roomName);
                creep.memory.targetID = i;
                Memory.MineAssigned[i] = true;
            }
        }
        if(creep.memory.targetPos) {
            var targetPos = new RoomPosition(creep.memory.targetPos.x, creep.memory.targetPos.y, creep.memory.targetPos.roomName);
            if(targetPos.lookFor(LOOK_STRUCTURES)[0] && targetPos.lookFor(LOOK_STRUCTURES)[0].structureType == STRUCTURE_CONTAINER) {
                if(creep.ticksToLive < 50) {
                    Memory.MineAssigned[creep.memory.targetID] = false;
                }
                if(!creep.pos.isEqualTo(targetPos)) {
                    if(creep.moveTo(targetPos, {visualizePathStyle: {stroke: '#ffff88'}}) == ERR_NO_PATH) {
                        creep.say("TrafficJam");
                    }
                }
                else if(targetPos.lookFor(LOOK_STRUCTURES)[0].store[RESOURCE_ENERGY] == targetPos.lookFor(LOOK_STRUCTURES)[0].storeCapacity) {
                    creep.say('Full');
                }
                else {
                    creep.harvest(creep.pos.findClosestByRange(FIND_SOURCES));
                }
            }
            else{
                creep.say('Container?');
            }
        }
        else{
            creep.say('???');
        }
    }
};

module.exports = roleMiner;