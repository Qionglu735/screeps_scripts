
let path_handler = require("tool.path_handler");

let role_scout = function(creep) {
    let control_level = Game.spawns["Spawn1"].room.controller.level;
    if(creep.memory.target_room == null) {
        for(let room_name in Memory.my_room) {
            if(Game.rooms[room_name] == null) {
                if(control_level < 4 && Memory.my_room[room_name].room_distance <= 1
                    || control_level < 6 && Memory.my_room[room_name].room_distance <= 2) {
                    creep.memory.target_room = room_name;
                    break;
                }
            }
        }
    }
    if(creep.memory.target_room == null) {
        creep.say("Idle");
    }
    else if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else {
        if(creep.room.name === creep.memory.target_room) {
            creep.memory.target_room = null;
        }
        else {
            path_handler.find_pos(creep, new RoomPosition(25, 25, creep.memory.target_room))
        }
    }

};

module.exports = role_scout;
