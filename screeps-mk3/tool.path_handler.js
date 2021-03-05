
let path_handler = {
    status_find: function(creep, target, action_status, distance, close_range) {
        switch(action_status) {
            case OK:
            case ERR_TIRED:
                break;
            case ERR_NOT_IN_RANGE:
                if(creep.pos.getRangeTo(target.pos) < close_range) {
                    let moveTo_status = creep.moveTo(target.pos);
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
                    let pathFinder = PathFinder.search(creep.pos, {pos: target.pos, range: distance});
                    if(pathFinder.incomplete === false || pathFinder.path.length > 0) {
                        creep.memory.path_list = pathFinder.path;
                        let moveTo_status = creep.moveTo(creep.memory.path_list[0]);
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
        while(creep.memory.path_list.length > 0 && (pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49)) {
            creep.memory.path_list.shift();
            pos = new RoomPosition(creep.memory.path_list[0].x,
                creep.memory.path_list[0].y,
                creep.memory.path_list[0].roomName);
        }  // avoid blinking at room edge
        let move_status = creep.moveTo(pos);
        switch(move_status) {
            case OK:
                if((creep.pos.x - pos.x) ** 2 + (creep.pos.y - pos.y) ** 2 <= 2
                    && creep.pos.roomName === pos.roomName) {
                    creep.memory.path_list.shift();
                }
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
        this.find_pos(creep, target.pos, distance, close_range);
    },
    find_pos: function(creep, pos, distance, close_range) {
        if(creep.pos.getRangeTo(pos) < close_range) {
            let moveTo_status = creep.moveTo(pos);
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
            let pathFinder = PathFinder.search(creep.pos, {pos: pos, range: distance});
            if(pathFinder.incomplete === false || pathFinder.path.length > 0) {
                creep.memory.path_list = pathFinder.path;
                let moveTo_status = creep.moveTo(creep.memory.path_list[0]);
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
