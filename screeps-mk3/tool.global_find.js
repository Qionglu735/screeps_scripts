
var global_find = {
    find: function(type) {
        var res = null;
        for(var room_name in Memory.Room) {
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
        return res;
    },
    
    find: function(type, filter) {
        var res = null;
        for(var room_name in Memory.Room) {
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
        return res;
    }
};

module.exports = global_find;
