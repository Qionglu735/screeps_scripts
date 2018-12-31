
var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.targetRoomName == '') {
            var i = 0;
            while(i < Memory.RoomsToClaim.length) {
                if(Memory.RoomsToClaim[i] == 1 || Memory.RoomsToClaim[3] == 3) {//to reverse or to claim
                    break;
                }
                i += 1;
            }
            if(i < Memory.RoomsToClaim.length) {
                creep.memory.targetRoomName = Memory.Rooms[i].name;
                creep.memory.targetRoomID = i;
                Memory.RoomsToClaim[i] += 1;
            }
        }
        else if(creep.room.name != creep.memory.targetRoomName
                || creep.room.name == creep.memory.targetRoomName
                && (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49)) {
            creep.moveTo(Game.flags[creep.memory.targetRoomName]);
        }
        else if(Memory.RoomsToClaim[creep.memory.targetRoomID] == 2) { //reversing
            var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_CONTROLLER})[0];
            var res = creep.reserveController(target);
            if(res == OK) {
                
            }
            else if(res == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}}) == ERR_NO_PATH) {
                    creep.say("TrafficJam");
                }
            }
            else if(res == ERR_INVALID_TARGET) {
                creep.say("Invalid");
            }
            else {
                creep.say("???");
            }
        }
        else if(Memory.RoomsToClaim[creep.memory.targetID] == 4) { //claiming
            var target = creep.room.find(FIND_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_CONTROLLER})[0];
            var res = creep.claimController(target);
            if(res == OK) {
                Memory.RoomToClaim[creep.memory.targetID] = 5; //claimed
            }
            if(res == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(target, {visualizePathStyle: {stroke: '#ff00ff'}}) == ERR_NO_PATH) {
                    creep.say("TrafficJam");
                }
            }
            else if(res == ERR_INVALID_TARGET) {
                creep.say("Invalid");
            }
            else if(res == ERR_FULL) {
                creep.say("Novice")
            }
            else if(res == ERR_GCL_NOT_ENOUGH) {
                creep.say("NeedGCL")
            }
            else {
                creep.say("???");
            }
        }
        else {
            creep.say("Idle");
        }
    }
};

module.exports = roleClaimer;
