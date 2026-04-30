
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
            if(room == null) {
                continue;
            }
            if(Memory.room_dict[room_name].hostile_status !== "neutral") {
                continue;
            }
            let out = null;
            if(opts["pos"] != null && opts.pos.roomName === room_name && opts["findClosestByRange"] === true) {
                if(filter != null) {
                    out = opts["pos"].findClosestByRange(type, filter);
                }
                else {
                    out = opts["pos"].findClosestByRange(type);
                }
            }
            else if(opts["pos"] != null && opts.pos.roomName === room_name && opts["findClosestByPath"] === true) {
                if(filter != null) {
                    out = opts["pos"].findClosestByPath(type, filter);
                }
                else {
                    out = opts["pos"].findClosestByPath(type);
                }
            }
            else {
                if(filter != null) {
                    out = room.find(type, filter);
                }
                else {
                    out = room.find(type);
                }
            }
            if(out != null) {
                res = res.concat(out);
            }
        }
        // console.log("global_find.find", Game.cpu.getUsed() - cpu)
        return res;
    },

    game_time_mark: null,
    spawn_list: null,
    extension_list: null,
    tower_list: null,
    link_list: null,

    reset_local_value: function() {
        this.spawn_list = null;
        this.extension_list = null;
        this.tower_list = null;
        this.game_time_mark = Game.time;
    },

    find_container_with_energy: function(main_room, creep_name, min_energy=0) {
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
            if (container_assigned_record[_c.id] == null) {
                container_assigned_record[_c.id] = [];
            }
            for (let i of container_assigned_record[_c.id]) {
                 if (!Game.creeps[i.creep_name] || Game.time - i.assigned_time > 60) {
                    container_assigned_record[_c.id].splice(container_assigned_record[_c.id].indexOf(i), 1);
                 }
            }
            if(_c.store[RESOURCE_ENERGY] === _c.store.getCapacity(RESOURCE_ENERGY)) {
                if (_c.store[RESOURCE_ENERGY] - (container_assigned_record[_c.id].reduce((acc, cur) => acc + cur.assigned_energy, 0)) < _c.store[RESOURCE_ENERGY]) {
                    continue;
                }
                max_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] >= min_energy) {
                if (_c.store[RESOURCE_ENERGY] - (container_assigned_record[_c.id].reduce((acc, cur) => acc + cur.assigned_energy, 0)) < min_energy) {
                    continue;
                }
                normal_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] > 0) {
                less_list.push(_c);
            }
        }
        if(max_list.length > 0) {
            res = max_list[Math.floor(Math.random() * max_list.length)];
        }
        else if(normal_list.length > 0) {
            res = normal_list[Math.floor(Math.random() * normal_list.length)];
        }
        else if(less_list.length > 0) {
            res = less_list[Math.floor(Math.random() * less_list.length)];
        }
        if(res != null) {
            container_assigned_record[res.id].push({
                "creep_name": creep_name,
                "assigned_time": Game.time,
                "assigned_energy": min_energy,
            });
            Memory.container_assigned_record = container_assigned_record;
        }
        // console.log("find_container_with_energy", (Game.cpu.getUsed() - cpu).toFixed(3) + "s")
        return res;
    },

    remove_container_assign_record: function(container_id, creep_name) {
        if(! Memory.container_assigned_record == null) {
            let container_assigned_record = Memory.container_assigned_record;
            if (container_assigned_record[container_id] != null) {
                for (let i of container_assigned_record[_c.id]) {
                    if (i.creep_name == creep_name) {
                        container_assigned_record[_c.id].splice(container_assigned_record[_c.id].indexOf(i), 1);
                    }
                }
            }
            Memory.container_assigned_record = container_assigned_record;
        }
    },

    find_structure_need_energy: function(creep) {
        // let cpu = Game.cpu.getUsed()

        if(this.game_time_mark !== Game.time) {
            this.reset_local_value();
        }

        if(Memory.transfer_assigned_record == null) {
            Memory.transfer_assigned_record = {};
        }

        if(this.spawn_list == null) {
            this.spawn_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].spawn_list) {
                if (Memory.transfer_assigned_record[i] != null) {
                    if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                        continue;
                    }
                    else {
                        delete Memory.transfer_assigned_record[i];
                    }
                }
                let spawn = Game.spawns[i];
                if(spawn != null && spawn.progress == null && spawn.store.getCapacity(RESOURCE_ENERGY) != null
                    && (spawn.store[RESOURCE_ENERGY] == null
                        // || spawn.store[RESOURCE_ENERGY] < 300
                        || spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY)
                    )
                ) {
                    this.spawn_list.push(spawn);
                }
            }
        }
        if(this.extension_list == null) {
            this.extension_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].extension_list) {
                if (Memory.transfer_assigned_record[i] != null) {
                    if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                        continue;
                    }
                    else {
                        delete Memory.transfer_assigned_record[i];
                    }
                }
                let extension = Game.getObjectById(i);
                if(extension!= null && extension.progress ==null
                    && extension.store[RESOURCE_ENERGY] < extension.store.getCapacity(RESOURCE_ENERGY)
                ) {
                    this.extension_list.push(extension);
                }
            }
        }
        if(this.tower_list == null) {
            this.tower_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].tower_list) {
                if (Memory.transfer_assigned_record[i] != null) {
                    if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                        continue;
                    }
                    else {
                        delete Memory.transfer_assigned_record[i];
                    }
                }
                let tower = Game.getObjectById(i);
                if(tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY)) {
                    this.tower_list.push(tower);
                }
            }
        }
        if (this.link_list == null) {
            this.link_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].link_list) {
                if (i != Memory.room_dict[creep.memory.main_room].link_spawn) {
                    continue;
                }
                if (Memory.transfer_assigned_record[i] != null) {
                    if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                        continue;
                    }
                    else {
                        delete Memory.transfer_assigned_record[i];
                    }
                }
                let link = Game.getObjectById(Memory.room_dict[creep.memory.main_room].link_spawn);
                if (link.store[RESOURCE_ENERGY] < link.store.getCapacity(RESOURCE_ENERGY)) {
                    this.link_list.push(link);
                }
            }
        }
        // console.log("find_structure_need_energy init", Game.cpu.getUsed() - cpu);

        let res = null;
        if(this.spawn_list.length > 0) {
            for(let i of this.spawn_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.spawn_list[Math.floor(Math.random() * this.spawn_list.length)];  // find random target
            }
        }
        if(res == null && this.link_list.length > 0) {
            let link_spawn = Game.getObjectById(Memory.room_dict[creep.memory.main_room].link_spawn);
            if(link_spawn != null) {
                if(link_spawn.store[RESOURCE_ENERGY] < link_spawn.store.getCapacity(RESOURCE_ENERGY)) {
                    res = link_spawn;
                }
            }
        }
        if(res == null && this.extension_list.length > 0) {
            for(let i of this.extension_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.extension_list[Math.floor(Math.random() * this.extension_list.length)];  // find random target
            }
        }
        if(res == null && this.tower_list.length > 0) {
            for(let i of this.tower_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.tower_list[Math.floor(Math.random() * this.tower_list.length)];  // find random target
            }
        }
        if(res == null) {
            let terminal = Game.rooms[creep.memory.main_room].terminal;
            if(terminal != null) {
                if(terminal.store[RESOURCE_ENERGY] < 10000) {
                    res = terminal;
                }
            }
        }
        // console.log("find_structure_need_energy find_target", Game.cpu.getUsed() - cpu);
        if(res != null) {
            Memory.transfer_assigned_record[res.id] = Game.time;
        }
        return res;
    },

    remove_transfer_assigned_record: function(structure_id) {
        if(! Memory.transfer_assigned_record == null) {
            delete Memory.transfer_assigned_record[structure_id];
        }
    },
};

module.exports = global_find;
