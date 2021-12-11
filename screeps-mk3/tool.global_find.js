
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

    reset_local_value: function() {
        this.spawn_list = null;
        this.extension_list = null;
        this.tower_list = null;
        this.game_time_mark = Game.time;
    },

    find_container_with_energy: function(main_room, min_energy=0) {
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
            if(_c.store[RESOURCE_ENERGY] === _c.store.getCapacity(RESOURCE_ENERGY)) {
                if(_c_id in container_assigned_record
                    && Game.time - container_assigned_record[_c_id] <= 30) {
                    continue;
                }
                max_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] >= min_energy) {
                if(_c_id in container_assigned_record
                    && Game.time - container_assigned_record[_c_id] <= 60) {
                    continue;
                }
                normal_list.push(_c);
            }
            else if(_c.store[RESOURCE_ENERGY] > 0) {
                less_list.push(_c);
            }
        }
        if(max_list.length > 0) {
            res = max_list[Game.time % max_list.length];
        }
        else if(normal_list.length > 0) {
            res = normal_list[0];
        }
        else if(less_list.length > 0) {
            res = less_list[0];
        }
        if(res != null) {
            container_assigned_record[res.id] = Game.time;
            Memory.container_assigned_record = container_assigned_record;
        }
        // console.log("find_container_with_energy", (Game.cpu.getUsed() - cpu).toFixed(3) + "s")
        return res;
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
                if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                    continue;
                }
                let spawn = Game.spawns[i];
                if(spawn != null && spawn.progress == null && spawn.store.getCapacity(RESOURCE_ENERGY) != null
                    && (spawn.store[RESOURCE_ENERGY] == null
                        // || spawn.store[RESOURCE_ENERGY] < 300
                        || spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY)
                    )) {
                    // && spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY)) {
                    this.spawn_list.push(spawn);
                }
            }
        }
        if(this.extension_list == null) {
            this.extension_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].extension_list) {
                if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                    continue;
                }
                let extension = Game.getObjectById(i);
                if(extension!= null && extension.progress ==null
                    && extension.energy < extension.energyCapacity) {
                    // && extension.store[RESOURCE_ENERGY] < extension.store.getCapacity(RESOURCE_ENERGY)) {
                    this.extension_list.push(extension);
                }
            }
        }
        if(this.tower_list == null) {
            this.tower_list = [];
            for(let i of Memory.room_dict[creep.memory.main_room].tower_list) {
                if(Game.time - Memory.transfer_assigned_record[i] < 10) {
                    continue;
                }
                let tower = Game.getObjectById(i);
                // if(tower.store[RESOURCE_ENERGY] < tower.store.getCapacity(RESOURCE_ENERGY)) {
                if(tower.energy < tower.energyCapacity) {
                    this.tower_list.push(tower);
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
                res = this.spawn_list[Game.time % this.spawn_list.length];  // find random target
            }
        }
        else if(this.extension_list.length > 0) {
            for(let i of this.extension_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.extension_list[Game.time % this.extension_list.length];  // find random target
            }
        }
        else if(this.tower_list.length > 0) {
            for(let i of this.tower_list) {  // find closet target
                if(creep.pos.isNearTo(i.pos)) {
                    res = i;
                    break;
                }
            }
            if(res == null) {
                res = this.tower_list[Game.time % this.tower_list.length];  // find random target
            }
        }
        if(res == null) {
            let main_room_memory = Memory.room_dict[creep.memory.main_room]
            let link_spawn = Game.getObjectById(main_room_memory.link_spawn);
            if(link_spawn != null) {
                if(link_spawn.store[RESOURCE_ENERGY] < link_spawn.store.getCapacity(RESOURCE_ENERGY)) {
                    res = link_spawn;
                }
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
    }
};

module.exports = global_find;
