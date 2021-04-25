
let room_check = function(main_room_name) {
    let cpu = Game.cpu.getUsed();
    let main_room = Game.rooms[main_room_name];
    let main_room_memory = Memory.room_dict[main_room_name];
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Main Room
    let max_scout_distance = 0;
    let max_reverse_distance = 0;
    // let max_sub_room_num = 0;
    let max_reverse_num = 0;
    let storage = null;
    if(main_room_memory.storage_list.length > 0) {
        storage = Game.getObjectById(main_room_memory.storage_list[0]);
    }
    switch(main_room.controller.level) {
        case 1:
        case 2:
        case 3:
            max_scout_distance = 1;
            break;
        case 4:
            max_scout_distance = 2;
            max_reverse_distance = 1;
            max_reverse_num = 1;
            break;
        case 5:
        case 6:
        case 7:
        case 8:
            max_scout_distance = 2;
            max_reverse_distance = 1;
            // max_sub_room_num = 1;
            max_reverse_num = 1;
            if(storage != null && storage.progress == null
                && storage.store[RESOURCE_ENERGY] < storage.store.getCapacity(RESOURCE_ENERGY) * 0.5
                && Game.cpu.bucket > 10000 * 0.7) {
                max_reverse_num += 1;
            }
            break;
    }
    let room_list = [main_room_name];
    let distance_list = [0];
    main_room_memory.sub_room_list = [];
    let i = 0;
    while(i < room_list.length) {
        if(!(room_list[i] in Memory.room_dict)) {
            Memory.room_dict[room_list[i]] = {...ROOM_TEMPLATE};
        }
        Memory.room_dict[room_list[i]].main_room = main_room_name;
        if(distance_list[i] === 0) {

        }
        else if(distance_list[i] <= max_reverse_distance
            && !main_room_memory.sub_room_list.includes(room_list[i])) {
            main_room_memory.sub_room_list.push(room_list[i])
            // if(main_room_memory.sub_room_list < max_sub_room_num) {
            //     main_room_memory.sub_room_list.push(room_list[i]);
            // }
        }
        else {
            // if(main_room_memory.sub_room_list.includes(room_list[i])) {
            //     for(let j in main_room_memory.sub_room_list) {
            //         if(main_room_memory.sub_room_list[j] === room_list[i]) {
            //             main_room_memory.sub_room_list.splice(j, 1);
            //         }
            //     }
            // }
        }
        Memory.room_dict[room_list[i]].room_distance[main_room_name] = distance_list[i];
        // console.log(room_list[i], distance_list[i])
        if(distance_list[i] + 1 <= max_scout_distance) {
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
    Memory.room_list = room_list;
    console.log("check main room", Game.cpu.getUsed() - cpu);
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Sub Room
    // for(let room_name in Memory.room_dict) {
    //     Memory.room_dict[room_name].claim_status = "neutral";
    // }
    let reverse_num = 0;
    for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
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
        if(["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)) {
            reverse_num += 1
        }
        ////    change claim status
        if(Memory.room_dict[room_name].claim_status === "neutral"
            && Memory.room_dict[room_name].hostile_status === "neutral"
            && reverse_num < max_reverse_num) {
            Memory.room_dict[room_name].claim_status = "to_reverse";
            reverse_num += 1;
        }
        else if(["to_reverse", "reversing", "reversed"].includes(Memory.room_dict[room_name].claim_status)
            && Memory.room_dict[room_name].hostile_status !== "neutral") {
            Memory.room_dict[room_name].claim_status = "neutral";
        }
        console.log(room_name,
            Memory.room_dict[room_name].claim_status, Memory.room_dict[room_name].hostile_status);
    }
    console.log("check sub room", Game.cpu.getUsed() - cpu);
};

module.exports = room_check;
