
var minePortCheck = require("tool.minePortCheck");

var roleGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.moveTo(Game.flags["ScoutTarget"], {visualizePathStyle: {stroke: "#ff0000"}});
        var flag = false;
        var i = 0;
        while(i < Memory.Rooms.length && creep.room.name != Memory.Rooms[i].name) {
            i += 1;
        }
        if(i == Memory.Rooms.length) {
            Memory.Rooms.push(creep.room);
            Memory.RoomsToClaim.push(0);
            minePortCheck.run(creep.room, Memory.Spawns[0].pos);
            creep.room.createFlag(25, 25, creep.room.name, COLOR_BROWN);
        }
        var target = creep.room.find(FIND_HOSTILE_CREEPS, {
                                    filter: (creep) => 
                                        creep.getActiveBodyparts(ATTACK) != 0 ||
                                        creep.getActiveBodyparts(RANGED_ATTACK) != 0 ||
                                        creep.getActiveBodyparts(CLAIM) != 0 ||
                                        creep.getActiveBodyparts(HEAL) != 0})[0];
        if(target) {
            creep.attack(target);
        }
    }
};

module.exports = roleGuard;
