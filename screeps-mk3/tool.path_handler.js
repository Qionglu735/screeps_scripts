
let path_handler = {
    move: function(creep) {
        if(creep.fatigue > 0) {
            return;
        }
        let path_list = null;
        try {
            path_list = JSON.parse(creep.memory.path_list);
        }
        catch(err) {  // compatible with array version
            path_list = creep.memory.path_list;
        }
        if(path_list.length === 0) {
            creep.memory.path_list = null;
            return;
        }
        let pos = new RoomPosition(path_list[0].x,
            path_list[0].y,
            path_list[0].roomName);
        while(path_list.length > 1 && (pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49)) {
            path_list.shift();
            if(path_list.length > 0) {
                creep.memory.path_list = JSON.stringify(path_list)
            }
            else {
                creep.memory.path_list = null;
            }
            pos = new RoomPosition(path_list[0].x,
                path_list[0].y,
                path_list[0].roomName);
        }  // avoid blinking at room edge
        if(path_list.length === 1 && (pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49)) {
            if(pos.x === 0 || pos.x === 49) {
                if (pos.x === 0) {
                    pos.x += 1;
                }
                if (pos.x === 49) {
                    pos.x -= 1;
                }
                if(this.get_cost_matrix(pos.roomName).get(pos.x, pos.y) < 255) {

                }
                else if (this.get_cost_matrix(pos.roomName).get(pos.x, pos.y - 1) < 255) {
                    pos.y -= 1;
                }
                else if (this.get_cost_matrix(pos.roomName).get(pos.x, pos.y + 1) < 255) {
                    pos.y -= 1;
                }
            }
            if(pos.y === 0 || pos.y === 49) {
                if(pos.y === 0) {
                    pos.y += 1;
                }
                if(pos.y === 49) {
                    pos.y -= 1;
                }
                if(this.get_cost_matrix(pos.roomName).get(pos.x, pos.y) < 255) {

                }
                else if (this.get_cost_matrix(pos.roomName).get(pos.x - 1, pos.y) < 255) {
                    pos.x -= 1;
                }
                else if (this.get_cost_matrix(pos.roomName).get(pos.x + 1, pos.y) < 255) {
                    pos.x -= 1;
                }
            }
        }  // if target pos is on edge, move in one step
        if(creep.pos.x === 0 || creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
            // creep already on edge
            if(creep.pos.roomName !== pos.roomName) {
                return;  // wait one tick to teleport to target room
            }
        }
        let move_status = creep.moveTo(pos);
        switch(move_status) {
            case OK:
                if((creep.pos.x - pos.x) ** 2 + (creep.pos.y - pos.y) ** 2 <= 2
                    && creep.pos.roomName === pos.roomName) {
                    path_list.shift();
                    if(path_list.length > 0) {
                        creep.memory.path_list = JSON.stringify(path_list)
                    }
                    else {
                        creep.memory.path_list = null;
                    }
                }
                break;
            case ERR_TIRED:
                break;
            case ERR_NO_PATH:
                creep.memory.path_list = null;
                console.log(creep.name, "no path from", creep.pos.x, creep.pos.y, creep.pos.roomName,
                    "to", pos.x, pos.y, pos.roomName)
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
            let cpu = Game.cpu.getUsed()
            let pathFinder = PathFinder.search(
                creep.pos,
                {pos: pos, range: distance},
                {
                    plainCost: 2,
                    swampCost: 5,
                    roomCallback: function(room_name) {
                        return path_handler.get_cost_matrix(room_name);
                    }
                }
            );
            // console.log("PathFinder.search", Game.cpu.getUsed() - cpu);
            if(pathFinder.incomplete === false || pathFinder.path.length > 0) {
                for(let i of pathFinder.path) {
                    let room = Game.rooms[i.roomName];
                    if (room == null) {
                        continue;
                    }
                    room.visual.circle(i.x, i.y, {fill: "#ff00ff", radius: 0.1, opacity: 0.7});
                }
                // creep.memory.path_list = pathFinder.path;  // TODO: compress path list for memory
                creep.memory.path_list = JSON.stringify(pathFinder.path);
            }
            else {
                creep.say("No Path");
            }
        }
    },

    get_cost_matrix: function(room_name, update=0) {
        let cost_matrix = new PathFinder.CostMatrix;
        let room = Game.rooms[room_name];
        if(room != null && room_name in Memory.room_dict) {
            let room_memory = Memory.room_dict[room_name];
            if(room_memory.cost_matrix == null || update !== 0) {
                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        cost_matrix.set(struct.pos.x, struct.pos.y, 1);
                    }
                    else if (struct.structureType !== STRUCTURE_CONTAINER
                        && (struct.structureType !== STRUCTURE_RAMPART || !struct.my)) {
                        cost_matrix.set(struct.pos.x, struct.pos.y, 255);
                    }
                });
                if (Memory.main_room_list.includes(room_name)) {
                    for (let container_id of room_memory.container_list) {
                        let container = Game.getObjectById(container_id);
                        cost_matrix.set(container.pos.x, container.pos.y, 255);
                    }
                    if (room_memory.spawn_list.length > 0) {
                        let main_spawn = Game.spawns[room_memory.spawn_list[0]];
                        for (let i in room_memory.extension_table) {
                            if (room_memory.extension_table.hasOwnProperty(i)) {
                                cost_matrix.set(main_spawn.pos.x + room_memory.extension_table[i][0],
                                    main_spawn.pos.y + room_memory.extension_table[i][1], 255);
                            }
                        }
                        for (let i in room_memory.storage_table) {
                            if (room_memory.storage_table.hasOwnProperty(i)) {
                                cost_matrix.set(main_spawn.pos.x + room_memory.storage_table[i][0],
                                    main_spawn.pos.y + room_memory.storage_table[i][1], 255);
                            }
                        }
                        for (let i in room_memory.tower_table) {
                            if (room_memory.tower_table.hasOwnProperty(i)) {
                                cost_matrix.set(main_spawn.pos.x + room_memory.tower_table[i][0],
                                    main_spawn.pos.y + room_memory.tower_table[i][1], 255);
                            }
                        }
                    }
                }
                room_memory.cost_matrix = cost_matrix.serialize();
            }
            else {
                cost_matrix = PathFinder.CostMatrix.deserialize(room_memory.cost_matrix);
            }
        }
        return cost_matrix;
    },

    get_direction_pos: function(pos, direction) {
        let delta_x =[0, 1, 1, 1, 0, -1, -1, -1];
        let delta_y = [-1, -1, 0, 1, 1, 1, 0, -1];
        let direction_dict = {
            "N": 0, "NE": 1, "E": 2, "SE": 3, "S": 4, "SW": 5, "W": 6, "NW": 7
        }
        let new_x = pos.x + delta_x[direction_dict[direction]];
        let new_y = pos.y + delta_y[direction_dict[direction]];
        if(new_x < 0 || new_x > 49 || new_y < 0 || new_y > 49) {
            return null;
        }
        return new RoomPosition(new_x, new_y, pos.roomName);
    }
};

module.exports = path_handler;

// TODO: store path in Memory
