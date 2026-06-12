
let path_handler = require("tool.path_handler");

let role_scout = function(creep) {
    let main_room_memory = Memory.room_dict[creep.memory.main_room];
    if (creep.memory.target_room == null) {
        let no_visual_room_list = main_room_memory.sub_room_list.concat(main_room_memory.scout_room_list).filter(function(x) {
            return Game.rooms[x] == null;
        });
        if (no_visual_room_list.length > 0) {
            creep.memory.target_room = no_visual_room_list[Math.floor(Math.random() *  no_visual_room_list.length)];
        }
        else {
            creep.memory.target_room = main_room_memory.scout_room_list[Math.floor(Math.random() *  main_room_memory.scout_room_list.length)];
        }
    }
    else if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        // console.log(creep.name, creep.memory.target_room, Memory.room_dict[creep.memory.target_room].room_distance[creep.memory.main_room])
        path_handler.move(creep);
    }
    else {
        // console.log(creep.name, creep.memory.target_room, Memory.room_dict[creep.memory.target_room].room_distance[creep.memory.main_room])
        if(creep.room.name === creep.memory.target_room) {
            let target = null;
            if (!target && typeof(FIND_SCORES) != "undefined") {
                let target_list = creep.room.find(FIND_SCORES);
                if (target_list.length > 0) {
                    target = target_list.reduce((a, b) => b.score > a.score ? b : a);
                    creep.moveTo(target);
                }
            }
            else if (!target && creep.room.controller != null) {
                if (creep.room.controller.my
                    || creep.room.controller.owner == null
                    || creep.room.controller.reservation.username === creep.owner.username
                    || creep.room.controller.reservation == null
                ) {
                    if (creep.room.controller.sign == null
                        || creep.room.controller.sign.text != SIGN_TEXT
                        || creep.room.controller.sign.username != creep.owner.username
                    ) {
                        let res = creep.signController(creep.room.controller, SIGN_TEXT);
                        switch(res) {
                            case OK:
                                break;
                            case ERR_NOT_IN_RANGE:
                                path_handler.find_pos(creep, creep.room.controller.pos);
                                break;
                            default:
                                console.log("[!]", creep.name, "signController", res);
                                creep.say(res);
                        }
                    }
                    else {
                        creep.memory.target_room = null;
                    }
                }
                else {
                    creep.memory.target_room = null;
                }
            }
            else {
                creep.memory.target_room = null;
            }
        }
        else {
            path_handler.find_pos(creep, new RoomPosition(25, 25, creep.memory.target_room))
        }
    }
};

module.exports = role_scout;
