
let path_handler = require("tool.path_handler");

let role_scout = function(creep) {
    let control_level = Game.spawns["Spawn1"].room.controller.level;
    if(creep.memory.target_room == null) {
        for(let room_name of Memory.room_list) {
            if(Game.rooms[room_name] == null) {
                if(control_level < 4 && Memory.room_dict[room_name].room_distance[creep.memory.main_room] <= 1
                    || control_level < 6 && Memory.room_dict[room_name].room_distance[creep.memory.main_room] <= 2) {
                    creep.memory.target_room = room_name;
                    break;
                }
            }
        }
    }
    if(creep.memory.target_room == null) {
        creep.say("Idle");
        console.log(creep.name, "idle")
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
