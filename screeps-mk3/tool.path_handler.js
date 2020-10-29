
var path_handler = {
    status_find: function(creep, target, action_status, distance, close_range) {
        switch(action_status) {
            case OK:
            case ERR_TIRED:
                break;
            case ERR_NOT_IN_RANGE:
                if(creep.pos.getRangeTo(target.pos) < close_range) {
                    moveTo_status = creep.moveTo(target.pos);
                    switch(moveTo_status) {
                        case OK:
                        case ERR_TIRED:
                            break;
                        case ERR_NO_PATH:
                            creep.say("Jam");
                            break;
                        default:
                            creep.say(moveTo_status);
                    }
                }
                else {
                    var pathFinder = PathFinder.search(creep.pos, {pos: target.pos, range: distance});
                    if(pathFinder.incomplete === false || pathFinder.path.length > 0) {
                        creep.memory.path_list = pathFinder.path;
                        moveTo_status = creep.moveTo(creep.memory.path_list[0]);
                        switch(moveTo_status) {
                            case OK:
                            case ERR_TIRED:
                                break;
                            case ERR_NO_PATH:
                                creep.say("Jam");
                                break;
                            default:
                                creep.say(moveTo_status);
                        }
                    }
                    else {
                        creep.say("No Path");
                    }
                }
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.memory.target_id = "";
                break;
            default:
                creep.say(action_status);
        }
    },
    move: function(creep) {
        let pos = new RoomPosition(creep.memory.path_list[0].x,
            creep.memory.path_list[0].y,
            creep.memory.path_list[0].roomName);
        let move_status = creep.moveTo(pos);
        switch(move_status) {
            case OK:
                creep.memory.path_list.shift();
                break;
            case ERR_TIRED:
                break;
            case ERR_NO_PATH:
                creep.memory.path_list = null;
                break;
            default:
                creep.say(move_status);
        }
    },
    find: function(creep, target, distance, close_range) {
        if(creep.pos.getRangeTo(target.pos) < close_range) {
            moveTo_status = creep.moveTo(target);
            switch(moveTo_status) {
                case OK:
                case ERR_TIRED:
                    break;
                case ERR_NO_PATH:
                    creep.say("Jam");
                    break;
                default:
                    creep.say(moveTo_status);
            }
        }
        else {
            var pathFinder = PathFinder.search(creep.pos, {pos: target.pos, range: distance});
            if(pathFinder.incomplete === false || pathFinder.path.length > 0) {
                creep.memory.path_list = pathFinder.path;
                moveTo_status = creep.moveTo(creep.memory.path_list[0]);
                switch(moveTo_status) {
                    case OK:
                    case ERR_TIRED:
                        creep.memory.path_list.shift();
                        break;
                    case ERR_NO_PATH:
                        creep.say("Jam");
                        break;
                    default:
                        creep.say(moveTo_status);
                }
            }
            else {
                creep.say("No Path");
            }
        }
    }
};

module.exports = path_handler;
