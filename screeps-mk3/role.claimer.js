
let path_handler = require("tool.path_handler");

let role_claimer = function(creep) {
    if(creep.memory.target_room == null) {
        for(let room_name of Memory.room_dict[creep.memory.main_room].sub_room_list) {
            if(Game.rooms[creep.memory.main_room].controller.level >=4
                // && Memory.room_dict[room_name].room_distance[creep.memory.main_room] <= 1
                && ["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)
                && Memory.room_dict[room_name].assigned_claimer == null) {
                creep.memory.target_room = room_name;
                creep.memory.target_id = null;
                Memory.room_dict[creep.memory.target_room].assigned_claimer = creep.name;
                break;
            }
        }
    }
    if(creep.memory.target_room != null
        && Memory.room_dict[creep.memory.target_room] != null
        && Memory.room_dict[creep.memory.target_room].claim_status === "to_reverse") {
        Memory.room_dict[creep.memory.target_room].claim_status = "reversing";
    }
    if(creep.memory.target_room == null || Memory.room_dict[creep.memory.target_room] == null) {
        console.log(creep.name, "no target room");
        creep.say("No Room");
    }
    else if(creep.memory.path_list != null && creep.memory.path_list.length > 0) {
        path_handler.move(creep);
    }
    else if(["reversing", "reversed"].includes(Memory.room_dict[creep.memory.target_room].claim_status)) {
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
    else if(Memory.room_dict[creep.memory.target_room].claim_status === "claiming") {
        let target = creep.room.find(FIND_STRUCTURES, {
            filter: (target) => target.structureType === STRUCTURE_CONTROLLER})[0];
        let claim_status = creep.claimController(target);
        switch(claim_status) {
            case OK:
                Memory.room_dict[creep.memory.target_room].claim_status = "claimed";
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
        console.log(creep.name, "idle")
        creep.say("Idle");
    }
};

module.exports = role_claimer;
