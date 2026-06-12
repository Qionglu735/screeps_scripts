
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
            max_scout_distance = 3;
        case 7:
        case 8:
            max_scout_distance = 4;
            max_reverse_distance = 1;
            // max_sub_room_num = 1;
            max_reverse_num = 0;
            if(storage != null && storage.progress == null) {
                if(storage.store[RESOURCE_ENERGY] < storage.store.getCapacity(RESOURCE_ENERGY) * 0.7
                    && Game.cpu.bucket > 10000 * 0.7) {
                    max_reverse_num += 1;
                }
                if(storage.store[RESOURCE_ENERGY] < storage.store.getCapacity(RESOURCE_ENERGY) * 0.5
                    && Game.cpu.bucket > 10000 * 0.7) {
                    max_reverse_num += 1;
                }
            }
            break;
    }
    let room_stack = [main_room_name];
    let distance_stack = [0];
    main_room_memory.sub_room_list= [];
    main_room_memory.scout_room_list = [];
    let i = 0;
    while (i < room_stack.length) {
        if (Object.hasOwn(Memory.room_dict, room_stack[i]) === false ) {
            Memory.room_dict[room_stack[i]] = {...ROOM_TEMPLATE};
        }
        Memory.room_dict[room_stack[i]].main_room = main_room_name;
        if (distance_stack[i] === 0) {
            // is main room
        }
        else if (distance_stack[i] <= max_reverse_distance
            && !main_room_memory.sub_room_list.includes(room_stack[i])
        ) {
            main_room_memory.sub_room_list.push(room_stack[i]);
        }
        else if (distance_stack[i] <= max_scout_distance) {
            main_room_memory.scout_room_list.push(room_stack[i]);
        }
        else {
            
        }
        Memory.room_dict[room_stack[i]].room_distance[main_room_name] = distance_stack[i];
        // console.log(room_stack[i], distance_stack[i])
        if (distance_stack[i] + 1 <= max_scout_distance) {
            let exit_info = Game.map.describeExits(room_stack[i]);
            for(let j of ["1", "3", "5", "7"]){
                if(exit_info[j] != null) {
                    if(!room_stack.includes(exit_info[j])) {
                        room_stack.push(exit_info[j]);
                        distance_stack.push(distance_stack[i] + 1);
                    }
                }
            }
        }
        i += 1;
    }
    Memory.room_list = room_stack;
    if (LOG_USED_TIME) {
        console.log("check main room", (Game.cpu.getUsed() - cpu).toFixed(3));
    }
    ////////////////////////////////////////////////////////////////////////////////
    ////    Check Sub Room
    // for(let room_name in Memory.room_dict) {
    //     Memory.room_dict[room_name].claim_status = "neutral";
    // }
    let reverse_num = 0;
    for(let room_name of [main_room_name].concat(main_room_memory.sub_room_list)) {
        //// check hostile status
        if(Game.rooms[room_name] != null) {
            let hostile_creep_list = Game.rooms[room_name].find(FIND_HOSTILE_CREEPS);
            let hostile_part_sum = hostile_creep_list.reduce(function(sum, creep) {
                return sum 
                    + creep.getActiveBodyparts(ATTACK)
                    + creep.getActiveBodyparts(RANGED_ATTACK)
                    + creep.getActiveBodyparts(CLAIM)
                ;
            }, 0);
            if(Game.rooms[room_name].find(FIND_HOSTILE_STRUCTURES).length > 0) {
                Memory.room_dict[room_name].hostile_status = "hostile_structure";
            }
            else if(hostile_part_sum > 0) {
                Memory.room_dict[room_name].hostile_status = "hostile_creep";
            }
            else {
                Memory.room_dict[room_name].hostile_status = "neutral";
            }
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
        if (Memory.room_dict[room_name].assigned_claimer != null && Game.creeps[Memory.room_dict[room_name].assigned_claimer] == null) {
            Memory.room_dict[room_name].assigned_claimer = null;
        }
        console.log(room_name,
            Memory.room_dict[room_name].claim_status, Memory.room_dict[room_name].hostile_status, Memory.room_dict[room_name].assigned_claimer);
    }
    if(LOG_USED_TIME) {
        console.log("check sub room", (Game.cpu.getUsed() - cpu).toFixed(3));
    }
};

module.exports = room_check;
