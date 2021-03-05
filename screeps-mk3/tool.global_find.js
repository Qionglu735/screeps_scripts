
let global_find = {
    find: function(type, distance = 0) {
        return this.find_by_filter(type, null, distance)
        // let res = [];
        // for(let room_name in Memory.my_room) {
        //     let room = Game.rooms[room_name];
        //     if(room != null && (distance === 0 || Memory.my_room[room_name].room_distance <= distance)) {
        //         let out = room.find(type);
        //         if(res == null) {
        //             res = out;
        //         }
        //         else {
        //             res = res.concat(out);
        //         }
        //     }
        // }
        // return res;
    },

    find_by_filter: function(type, filter, distance = 0) {
        let res = [];
        for(let room_name in Memory.my_room) {
            let room = Game.rooms[room_name];
            if(room != null && (distance === 0 || Memory.my_room[room_name].room_distance <= distance)) {
                let out = room.find(type, filter);
                if(res == null) {
                    res = out;
                }
                else {
                    res = res.concat(out);
                }
            }
        }
        return res;
    },

    find_container_with_energy: function(range="spawn", location_name="all", min_energy=0) {
        let container_list = [];
        let res = null;
        if(range === "spawn") {
            container_list = Memory.my_spawn["Spawn1"].container_list;
        }
        else if(range === "room") {
            for(let _c_id of Memory.my_spawn["Spawn1"].container_list) {
                let _c = Game.getObjectById(_c_id);
                if(_c.pos.roomName === location_name) {
                    container_list.push(_c_id);
                }
            }
        }
        let max_list = [];  // container have a lot of energy
        let normal_list = [];  // container have enough energy
        let less_list = [];  // container have any energy
        for(let _c_id of container_list) {
            let _c = Game.getObjectById(_c_id);
            if(_c == null) {
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
