
let room_check = function(main_room_name) {
    let main_room = Game.rooms[main_room_name];
    let main_room_memory = Memory.room_dict[main_room_name];
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Main Room
    let max_distance = 0;
    switch(main_room.controller.level) {
        case 4:
        case 5:
            max_distance = 1;
            break;
    }
    let room_list = [main_room_name];
    let distance_list = [0];
    main_room_memory.sub_room_list = [];
    let i = 0;
    while(i < room_list.length) {
        if(!room_list[i] in Memory.room_dict) {
            Memory.room_dict[room_list[i]] = ROOM_TEMPLATE;
        }
        Memory.room_dict[room_list[i]].main_room = main_room_name;
        if(distance_list[i] === 0) {

        }
        else if(!main_room_memory.sub_room_list.includes(room_list[i])) {
            main_room_memory.sub_room_list.push(room_list[i]);
        }
        Memory.room_dict[room_list[i]].room_distance[main_room_name] = distance_list[i];
        // console.log(room_list[i], distance_list[i])
        if(distance_list[i] + 1 <= max_distance) {
            let exit_info = Game.map.describeExits(room_list[i]);
            for(let j of ["1", "3", "5", "7"]){
                if(exit_info[j] != null) {
                    if(!room_list.includes(exit_info[j])) {
                        room_list.push(exit_info[j]);
                        distance_list.push(distance_list[i] + 1);
                    }
                }
            }
        }
        i += 1;
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Sub Room
    for(let room_name of main_room_memory.sub_room_list) {
        //// check hostile status
        if(Game.rooms[room_name] == null) {

        }
        else if(Game.rooms[room_name].find(FIND_HOSTILE_STRUCTURES).length > 0) {
            Memory.room_dict[room_name].hostile_status = "hostile_structure";
        }
        else if(Game.rooms[room_name].find(FIND_HOSTILE_CREEPS).length > 0) {
            Memory.room_dict[room_name].hostile_status = "hostile_creep";
        }
        else {
            Memory.room_dict[room_name].hostile_status = "neutral";
        }
        ////    check hostile claim status
        if(Game.rooms[room_name] == null) {

        }
        else if(Game.rooms[room_name].controller.level > 0) {
            if(Game.rooms[room_name].controller.my) {
                Memory.room_dict[room_name].claim_status = "claimed";
            }
            else {
                Memory.room_dict[room_name].claim_status = "claim_by_hostile";
            }
        }
        else if(Game.rooms[room_name].controller.reservation) {
            if(Game.rooms[room_name].controller.reservation.username === main_room.controller.owner.username) {
                Memory.room_dict[room_name].claim_status = "reversed";
            }
            else {
                Memory.room_dict[room_name].claim_status = "reverse_by_hostile";
            }
        }
        else {
            if(["claim_by_hostile", "reverse_by_hostile"].includes(Memory.room_dict[room_name].claim_status)) {
                Memory.room_dict[room_name].claim_status = "neutral";
            }
        }
        ////    change claim status
        if(Memory.room_dict[room_name].claim_status === "neutral"
            && Memory.room_dict[room_name].hostile_status === "neutral") {
            Memory.room_dict[room_name].claim_status = "to_reverse";
        }
        else if(["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)
            && Memory.room_dict[room_name].hostile_status !== "neutral") {
            Memory.room_dict[room_name].claim_status = "neutral";
        }
        // console.log(room_name,
        //     Memory.room_dict[room_name].claim_status, Memory.room_dict[room_name].hostile_status);
    }
};

module.exports = room_check;