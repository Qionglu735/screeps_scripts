
let global_find = {
    find: function(type, filter=null, opts={}) {
        // let cpu = Game.cpu.getUsed()
        let res = [];
        let room_list = Memory.room_list;
        if(opts["main_room_name"] != null) {
            room_list = [opts["main_room_name"]].concat(Memory.room_dict[opts["main_room_name"]].sub_room_list);
        }
        for(let room_name of room_list) {
            if(opts["main_room_name"] != null && opts["room_distance"] != null) {
                if(Memory.room_dict[room_name].room_distance[opts["main_room_name"]] > opts["room_distance"]) {
                    continue;
                }
            }
            let room = Game.rooms[room_name];
            if(room != null) {
                let out = null;
                if(filter != null) {
                    out = room.find(type, filter);
                }
                else {
                    out = room.find(type);
                }
                if(out != null) {
                    res = res.concat(out);
                }
            }
        }
        // console.log("global_find.find", Game.cpu.getUsed() - cpu)
        return res;
    },

    find_container_with_energy: function(main_room, min_energy=0) {
        // let cpu = Game.cpu.getUsed();
        let container_list = Memory.room_dict[main_room].container_list;
        if(Memory.container_assigned_record == null) {
            Memory.container_assigned_record = {};
        }
        let container_assigned_record = Memory.container_assigned_record;
        let res = null;
        let max_list = [];  // container have a lot of energy
        let normal_list = [];  // container have enough energy
        let less_list = [];  // container have any energy
        for(let _c_id of container_list) {
            let _c = Game.getObjectById(_c_id);
            if(_c == null) {
                continue;
            }
            if(_c.room == null) {
                continue;
            }
            if(Memory.room_dict[_c.room.name].hostile_status !== "neutral") {
                continue;
            }
            if(_c.progress != null) {
                continue;
            }
            if(_c.store[RESOURCE_ENERGY] === _c.store.getCapacity(RESOURCE_ENERGY)) {
                if(_c_id in container_assigned_record
                    && Game.time - container_assigned_record[_c_id] <= 30) {
                    continue;
                }
                max_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] >= min_energy) {
                if(_c_id in container_assigned_record
                    && Game.time - container_assigned_record[_c_id] <= 60) {
                    continue;
                }
                normal_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] > 0) {
                less_list.push(_c);
            }
        }
        if(max_list.length > 0) {
            res = max_list[Game.time % max_list.length];
        }
        else if(normal_list.length > 0) {
            res = normal_list[0];
        }
        else if(less_list.length > 0) {
            res = less_list[0];
        }
        if(res != null) {
            container_assigned_record[res.id] = Game.time;
            Memory.container_assigned_record = container_assigned_record;
        }
        // console.log("find_container_with_energy", (Game.cpu.getUsed() - cpu).toFixed(3) + "s")
        return res;
    },

    // TODO: find_structure_need_energy
};

module.exports = global_find;
