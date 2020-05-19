
var global_find = {
    find: function(type, spawn_name="all") {
        var res = null;
        var spawn_name_list = [];
        if(spawn_name == "all" || !(spawn_name in Memory.my_spawn)) {
            for(var i in Memory.my_spawn) {
                spawn_name_list.push(i);
            }
        }
        else {
            spawn_name_list.push(i);
        }
        for(var i in spawn_name_list) {
            var _spawn_name = spawn_name_list[i];
            for(var room_name in Memory.my_spawn[_spawn_name].room) {
                var room = Game.rooms[room_name];
                if(room != null) {
                    var out = room.find(type);
                    if(res == null) {
                        res = out;
                    }
                    else {
                        res = res.concat(out);
                    }
                }
            }
        }
        return res;
    },
    
    find: function(type, filter, spawn_name="all") {
        var res = null;
        var spawn_name_list = [];
        if(spawn_name == "all" || !(spawn_name in Memory.my_spawn)) {
            for(var i in Memory.my_spawn) {
                spawn_name_list.push(i);
            }
        }
        else {
            spawn_name_list.push(i);
        }
        for(var i in spawn_name_list) {
            var _spawn_name = spawn_name_list[i];
            for(var room_name in Memory.my_spawn[_spawn_name].room) {
                var room = Game.rooms[room_name];
                if(room != null) {
                    var out = room.find(type, filter);
                    if(res == null) {
                        res = out;
                    }
                    else {
                        res = res.concat(out);
                    }
                }
            }
        }
        return res;
    },

    find_container_with_energy: function(range="spawn", location_name="all", min_energy=0, random_choose=0) {
        var target_list = [];
        var spawn_name_list = [];
        if(range == "spawn" && (location_name == "all" || !(location_name in Memory.my_spawn)) || range == "room") {
            for(var i in Memory.my_spawn) {
                spawn_name_list.push(i);
            }
        }
        else {
            spawn_name_list.push(location_name);
        }
        for(var i in spawn_name_list) {
            var _spawn_name = spawn_name_list[i];
            if(_spawn_name in Memory.my_spawn) {
                var container_list = Memory.my_spawn[_spawn_name].container_list;
                for(var j in container_list) {
                    var container = Game.getObjectById(container_list[j])
                    if(container != null && container.progress == null) {
                        if(range == "room" && container.room.name != location_name) {
                            continue;
                        }
                        if(container.store[RESOURCE_ENERGY] > min_energy) {
                            target_list.push(container);
                        }
                    }
                }
            }
        }
        if(target_list === 0) {  // not found
            return null;
        }
        else if(random_choose === 0) {  // return the first one
            return target_list[0];
        }
        else if(random_choose === 1) { // return a random one
            return target_list[parseInt(Math.random() * 1000) % target_list.length];
        }
        else {  // illegal parameter
            return null;
        }
    },
};


};

module.exports = global_find;
