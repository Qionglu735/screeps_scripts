
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
    nuker_list: null,

    container_list: null,
    dropped_list: null,

    reset_local_value: function() {
        this.spawn_list = null;
        this.extension_list = null;
        this.tower_list = null;
        this.link_list = null;
        this.nuker_list = null;
        
        this.container_list = null;
        this.dropped_list = null;

        this.game_time_mark = Game.time;
    },

    find_dropped_resource: function(main_room, creep_name) {
        // let cpu = Game.cpu.getUsed();
        if (this.dropped_list == null) {
            this.dropped_list = [];
            for (let item of global_find.find(FIND_DROPPED_RESOURCES, {
                    filter: (target) =>
                        target.resourceType === creep.memory.type
                        && 5 <= target.pos.x && target.pos.x <= 45
                        && 5 <= target.pos.y && target.pos.y <= 45
                }
            )) {
                this.dropped_list.push(item.id);
            }
        }
        // console.log("find_dropped_resource", (Game.cpu.getUsed() - cpu).toFixed(3) + "s")
    },

    find_container_with_energy: function(main_room, creep_name, min_energy=1) {
        // let cpu = Game.cpu.getUsed();

        if (this.game_time_mark !== Game.time) {
            this.reset_local_value();
        }

        if (Memory.container_assigned_record == null) {
            Memory.container_assigned_record = {};
        }
        let record = Memory.container_assigned_record;

        if (this.container_list == null) {
            this.container_list = [];
            for (let _c_id of Memory.room_dict[main_room].container_list) {
                let _c = Game.getObjectById(_c_id);
                if (_c == null) {
                    continue;
                }
                if (_c.room == null) {
                    continue;
                }
                if (Memory.room_dict[_c.room.name].hostile_status !== "neutral") {
                    continue;
                }
                if (_c.progress != null) {
                    continue;
                }
                this.container_list.push(_c);
            }
            this.container_list = this.container_list.concat(
                this.find(FIND_TOMBSTONES, {
                    filter: (target) =>
                        target.store[RESOURCE_ENERGY] > 0
                        && 5 <= target.pos.x && target.pos.x <= 45
                        && 5 <= target.pos.y && target.pos.y <= 45
                })
            );
        }
        let max_list = [];  // container have a lot of energy
        let normal_list = [];  // container have enough energy
        let less_list = [];  // container have any energy
        let _id_list = [];
        for (let _c of this.container_list) {
            _id_list.push(_c.id);
            if (record[_c.id] == null) {
                record[_c.id] = [];
            }
            for (let i of record[_c.id]) {
                if (!Game.creeps[i.creep_name] || Game.time - i.assigned_time > 60) {
                    record[_c.id].splice(record[_c.id].indexOf(i), 1);
                }
            }
            if (_c.store[RESOURCE_ENERGY] >= _c.store.getCapacity(RESOURCE_ENERGY) * 0.9) {
                if (_c.store[RESOURCE_ENERGY] - (record[_c.id].reduce((acc, cur) => acc + cur.assigned_energy, 0)) < min_energy) {
                    continue;
                }
                max_list.push(_c);
            }
            else if (_c.store[RESOURCE_ENERGY] >= min_energy) {
                if (_c.store[RESOURCE_ENERGY] - (record[_c.id].reduce((acc, cur) => acc + cur.assigned_energy, 0)) < min_energy) {
                    continue;
                }
                normal_list.push(_c);
            }
            else if (_c.store[RESOURCE_ENERGY] > 0) {
                if (_c.store[RESOURCE_ENERGY] - (record[_c.id].reduce((acc, cur) => acc + cur.assigned_energy, 0)) < 0) {
                    continue;
                }
                less_list.push(_c);
            }
        }
        for (let item_id in record) {
            if (_id_list.includes(item_id) === false) {
                delete record[item_id];
            }
        }
        
        let res = null;
        if (max_list.length > 0) {
            res = max_list[Math.floor(Math.random() * max_list.length)];
        }
        else if (normal_list.length > 0) {
            res = normal_list[Math.floor(Math.random() * normal_list.length)];
        }
        else if (less_list.length > 0) {
            res = less_list[Math.floor(Math.random() * less_list.length)];
        }
        if (res != null) {
            record[res.id].push({
                "creep_name": creep_name,
                "assigned_time": Game.time,
                "assigned_energy": min_energy,
            });
        }
        // console.log("find_container_with_energy", (Game.cpu.getUsed() - cpu).toFixed(3) + "s")
        return res;
    },

    remove_container_assign_record: function(container_id, creep_name) {
        if(Memory.container_assigned_record == null) {
            Memory.container_assigned_record = {};
        }
        let record = Memory.container_assigned_record;

        if (record[container_id] != null) {
            for (let i of record[container_id]) {
                if (i.creep_name == creep_name) {
                    record[container_id].splice(record[container_id].indexOf(i), 1);
                }
            }
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
        let record = Memory.transfer_assigned_record;

        if (this.spawn_list == null) {
            this.spawn_list = [];
            for (let i of Memory.room_dict[creep.memory.main_room].spawn_list) {
                if (record[i] != null) {
                    if(Game.time - record[i] < 10) {
                        continue;
                    }
                    else {
                        delete record[i];
                    }
                }
                let spawn = Game.spawns[i];
                if (spawn != null && spawn.progress == null && spawn.store.getCapacity(RESOURCE_ENERGY) != null
                    && (spawn.store[RESOURCE_ENERGY] == null
                        // || spawn.store[RESOURCE_ENERGY] < 300
                        || spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY)
                    )
                ) {
                    this.spawn_list.push(spawn);
                }
            }
        }
        if (this.extension_list == null) {
            this.extension_list = [];
            for (let i of Memory.room_dict[creep.memory.main_room].extension_list) {
                if (record[i] != null) {
                    if(Game.time - record[i] < 10) {
                        continue;
                    }
                    else {
                        delete record[i];
                    }
                }
                let extension = Game.getObjectById(i);
                if (extension!= null && extension.progress ==null
                    && extension.store[RESOURCE_ENERGY] < extension.store.getCapacity(RESOURCE_ENERGY)
                ) {
                    this.extension_list.push(extension);
                }
            }
        }
        if (this.tower_list == null) {
            this.tower_list = [];
            for (let i of Memory.room_dict[creep.memory.main_room].tower_list) {
                if (record[i] != null) {
                    if(Game.time - record[i] < 10) {
                        continue;
                    }
                    else {
                        delete record[i];
                    }
                }
                let tower = Game.getObjectById(i);
                if (tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY)) {
                    this.tower_list.push(tower);
                }
            }
        }
        if (this.link_list == null) {
            this.link_list = [];
            for (let i of Memory.room_dict[creep.memory.main_room].link_list) {
                if (i != Memory.room_dict[creep.memory.main_room].link_spawn) {
                    continue;
                }
                if (record[i] != null) {
                    if(Game.time - record[i] < 10) {
                        continue;
                    }
                    else {
                        delete record[i];
                    }
                }
                let link = Game.getObjectById(Memory.room_dict[creep.memory.main_room].link_spawn);
                if (link.store[RESOURCE_ENERGY] < link.store.getCapacity(RESOURCE_ENERGY)) {
                    this.link_list.push(link);
                }
            }
        }
        if (this.nuker_list == null) {
            this.nuker_list = [];
            for (let i of Memory.room_dict[creep.memory.main_room].nuker_list) {
                if (record[i] != null) {
                    if(Game.time - record[i] < 10) {
                        continue;
                    }
                    else {
                        delete record[i];
                    }
                }
                let nuker = Game.getObjectById(i);
                if (nuker!= null && nuker.progress == null
                    && nuker.store[RESOURCE_ENERGY] < nuker.store.getCapacity(RESOURCE_ENERGY)
                ) {
                    this.nuker_list.push(nuker);
                }
            }
        }
        // console.log("find_structure_need_energy init", Game.cpu.getUsed() - cpu);

        let res = null;
        if (this.spawn_list.length > 0) {
            for (let i of this.spawn_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.spawn_list[Math.floor(Math.random() * this.spawn_list.length)];  // find random target
            }
        }
        if (res == null && this.link_list.length > 0) {
            let link_spawn = Game.getObjectById(Memory.room_dict[creep.memory.main_room].link_spawn);
            if (link_spawn != null) {
                if (link_spawn.store[RESOURCE_ENERGY] < link_spawn.store.getCapacity(RESOURCE_ENERGY)) {
                    res = link_spawn;
                }
            }
        }
        if (res == null && this.extension_list.length > 0) {
            for (let i of this.extension_list) {  // find closet target
                if (creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.extension_list[Math.floor(Math.random() * this.extension_list.length)];  // find random target
            }
        }
        if (res == null && this.tower_list.length > 0) {
            for (let i of this.tower_list) {  // find closet target
                if (creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.tower_list[Math.floor(Math.random() * this.tower_list.length)];  // find random target
            }
        }
        if (res == null && this.nuker_list.length > 0) {
            for (let i of this.nuker_list) {  // find closet target
                if (creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.nuker_list[Math.floor(Math.random() * this.nuker_list.length)];  // find random target
            }
        }
        // console.log("find_structure_need_energy find_target", Game.cpu.getUsed() - cpu);
        if (res != null) {
            record[res.id] = Game.time;
        }
        return res;
    },

    remove_transfer_assigned_record: function(structure_id) {
        if (Memory.transfer_assigned_record == null) {
            Memory.transfer_assigned_record = {};
        }
        let record = Memory.transfer_assigned_record;
        
        if (record[structure_id] != null) {
            delete record[structure_id];
        }
    },
};

module.exports = global_find;
