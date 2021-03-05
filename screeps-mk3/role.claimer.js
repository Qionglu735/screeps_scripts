
let path_handler = require("tool.path_handler");

let role_claimer = function(creep) {
    if(creep.memory.target_room == null) {
        for(let room_name in Memory.my_room) {
            if(Memory.my_room[room_name].room_distance <= 1
                && Memory.my_room[room_name].claim_status === "to_reverse") {
                creep.memory.target_room = room_name;
                creep.memory.target_id = null;
                Memory.my_room[room_name].claim_status = "reversing";
                break;
            }
        }
    }
    if(creep.memory.target_room == null) {
        creep.say("Idle");
    }
    else if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(Memory.my_room[creep.memory.target_room].claim_status === "reversing") { //reversing
        let target = Game.getObjectById(creep.memory.target_id);
        if(!target) {
            let room = Game.rooms[creep.memory.target_room];
            if(room == null) {
                console.log(creep.name, creep.memory.target_room, "no visual");
                creep.say("No Visual");
                path_handler.find_pos(creep, new RoomPosition(25, 25, creep.memory.target_room))
            }
            else {
                let targets = room.find(FIND_STRUCTURES, {
                    filter: (target) => target.structureType === STRUCTURE_CONTROLLER});
                if(targets.length > 0) {
                    target = targets[0];
                    creep.memory.target_id = target.id;
                }
            }
        }
        if(target) {
            let reverse_status = creep.reserveController(target);
            switch(reverse_status) {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    path_handler.find_pos(creep, target.pos);
                    break;
                default:
                    console.log(creep.name, "reverse", reverse_status);
                    creep.say(reverse_status)
            }
        }
        else {
            console.log(creep.name, creep.memory.target_room, "no controller");
        }
    }
    else if(Memory.my_room[creep.memory.target_room].claim_status === "claiming") { //claiming
        let target = creep.room.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType === STRUCTURE_CONTROLLER})[0];
        let claim_status = creep.claimController(target);
        switch(claim_status) {
            case OK:
                Memory.RoomToClaim[creep.memory.targetRoomID] = 5; //claimed
                break;
            case ERR_NOT_IN_RANGE:
                path_handler.find_pos(creep, target.pos);
                break;
            default:
                console.log(creep.name, "claim", claim_status);
                creep.say(claim_status)
        }
    }
    else {
        creep.say("Idle");
    }
};

module.exports = role_claimer;
