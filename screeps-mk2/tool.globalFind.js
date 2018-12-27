
var globalFind = {
    find: function(type) {
        var res = null;
        var i = 0;
        while(i < Memory.Rooms.length && typeof Game.rooms[Memory.Rooms[i].name] != "undefined") {
            var out = Game.rooms[Memory.Rooms[i].name].find(type);
            if(res == null) {
                res = out;
            }
            else {
                res = res.concat(out);
            }
            i += 1;
        }
        return res;
    },
    
    find: function(type, filter) {
        var res = null;
        var i = 0;
        while(i < Memory.Rooms.length && typeof Game.rooms[Memory.Rooms[i].name] != "undefined") {
            var out = Game.rooms[Memory.Rooms[i].name].find(type, filter);
            if(res == null) {
                res = out;
            }
            else {
                res = res.concat(out);
            }
            i += 1;
        }
        return res;
    }
};

/*
function finding(type) {
    var res = null;
    var i = 0;
    while(i < Memory.Rooms.length && typeof Game.rooms[Memory.Rooms[i].name] != "undefined") {
        var out = Game.rooms[Memory.Rooms[i].name].find(type);
        if(res == null) {
            res = out;
        }
        else {
            res = res.concat(out);
        }
        i += 1;
    }
    return res;
};

function finding(type, filter) {
    var res = null;
    var i = 0;
    while(i < Memory.Rooms.length && typeof Game.rooms[Memory.Rooms[i].name] != "undefined") {
        var out = Game.rooms[Memory.Rooms[i].name].find(type, filter);
        //console.log(out);
        if(res == null) {
            res = out;
        }
        else {
            res = res.concat(out);
        }
        i += 1;
    }
    return res;
};
*/

module.exports = globalFind;