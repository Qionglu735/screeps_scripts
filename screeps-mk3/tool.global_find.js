
let global_find = {
    find: function(type, filter=null, opts={}) {
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
        return res;
    },

    find_container_with_energy: function(main_room, min_energy=0) {
        let container_list = Memory.room_dict[main_room].container_list;
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
                max_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] >= min_energy) {
                normal_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] > 0) {
                less_list.push(_c);
            }
        }
        if(max_list.length > 0) {
            res = max_list[Math.floor(Math.random() * 1000) % max_list.length];
        }
        else if(normal_list.length > 0) {
            res = normal_list[0];
        }
        else if(less_list.length > 0) {
            res = less_list[0];
        }
        return res;
    },
};

module.exports = global_find;
