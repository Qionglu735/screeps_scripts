
var find_path_and_move = {
    find: function(creep, target, action_status, close_range) {
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
                    var pathFinder = PathFinder.search(creep.pos, {pos: target.pos, range: 1});
                    if(pathFinder.incomplete == false || pathFinder.path.length > 0) {
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
    }
};

module.exports = find_path_and_move;
