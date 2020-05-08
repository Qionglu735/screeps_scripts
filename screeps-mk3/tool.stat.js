
var mine_port_check = require("tool.mine_port_check");

var stat = {
    run: function() {
        ///////////////////////////////////////////////////////////////////////
        ////    Mine Check
        for(var room_name in Memory.Room) {
            for(var i in Memory.Room[room_name].container_list) {
                if(Game.getObjectById(Memory.Room[room_name].container_list[i]) == null) {
                    Memory.Room[room_name].container_list.splice(i, 1);
                }
            }
            mine_port_check.run(room_name);
        }
        ///////////////////////////////////////////////////////////////////////
        ////    Energy Stat
        for(var spawn_name in Memory.Spawn) {
            var room_name = Game.spawns[spawn_name].room.name;
            var energy_stat = Memory.Room[room_name].energy_stat;
            var energy = Game.rooms[room_name].energyAvailable;
            if(!energy) energy = 0;
            for(var i in Memory.Room[room_name].container_list) {
                var obj = Game.getObjectById(Memory.Room[room_name].container_list[i]);
                if(obj.structureType == STRUCTURE_CONTAINER && obj.progress == null){
                    energy += obj.store[RESOURCE_ENERGY];
                }
            }
            for(var id in Memory.Room[room_name].storage_list) {
                var obj = Game.getObjectById(Memory.Room[room_name].storage_list[i]);
                if(obj.structureType == STRUCTURE_STORAGE && obj.progress == null) {
                    energy += obj.store[RESOURCE_ENERGY];
                }
            }
            energy_stat.energy_track.unshift(energy);
            if(energy_stat.energy_track.length > 0) {
                if(energy_stat["10_tick_sum_a"] == null) energy_stat["10_tick_sum_a"] = 0;
                if(energy_stat["100_tick_sum_a"] == null) energy_stat["100_tick_sum_a"] = 0;
                if(energy_stat["500_tick_sum_a"] == null) energy_stat["500_tick_sum_a"] = 0;
                if(energy_stat["1000_tick_sum_a"] == null) energy_stat["1000_tick_sum_a"] = 0;
                if(energy_stat["10000_tick_sum_a"] == null) energy_stat["10000_tick_sum_a"] = 0;
                energy_stat["10_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["100_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["500_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["1000_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["10000_tick_sum_a"] += energy_stat.energy_track[0];
            }
            if(energy_stat.energy_track.length > 10) {
                energy_stat["10_tick_sum_a"] -= energy_stat.energy_track[10];
                if(energy_stat["10_tick_sum_b"] == null) energy_stat["10_tick_sum_b"] = 0;
                energy_stat["10_tick_sum_b"] += energy_stat.energy_track[10];
            }
            if(energy_stat.energy_track.length > 20) {
                energy_stat["10_tick_sum_b"] -= energy_stat.energy_track[20];
            }
            if(energy_stat.energy_track.length > 100) {
                energy_stat["100_tick_sum_a"] -= energy_stat.energy_track[100];
                if(energy_stat["100_tick_sum_b"] == null) energy_stat["100_tick_sum_b"] = 0;
                energy_stat["100_tick_sum_b"] += energy_stat.energy_track[100];
            }
            if(energy_stat.energy_track.length > 200) {
                energy_stat["100_tick_sum_b"] -= energy_stat.energy_track[200];
            }
            if(energy_stat.energy_track.length > 500) {
                energy_stat["500_tick_sum_a"] -= energy_stat.energy_track[500];
                if(energy_stat["500_tick_sum_b"] == null) energy_stat["500_tick_sum_b"] = 0;
                energy_stat["500_tick_sum_b"] += energy_stat.energy_track[500];
            }
            if(energy_stat.energy_track.length > 1000) {
                energy_stat["500_tick_sum_b"] -= energy_stat.energy_track[1000];
                energy_stat["1000_tick_sum_a"] -= energy_stat.energy_track[1000];
                if(energy_stat["1000_tick_sum_b"] == null) energy_stat["1000_tick_sum_b"] = 0;
                energy_stat["1000_tick_sum_b"] += energy_stat.energy_track[1000];
            }
            if(energy_stat.energy_track.length > 2000) {
                energy_stat["1000_tick_sum_b"] -= energy_stat.energy_track[2000];
            }
            if(energy_stat.energy_track.length > 10000) {
                energy_stat["10000_tick_sum_a"] -= energy_stat.energy_track[10000];
                if(energy_stat["10000_tick_sum_b"] == null) energy_stat["10000_tick_sum_b"] = 0;
                energy_stat["10000_tick_sum_b"] += energy_stat.energy_track[10000];
            }
            if(energy_stat.energy_track.length > 20000) {
                energy_stat["10000_tick_sum_b"] -= energy_stat.energy_track[20000];
            }
            while(energy_stat.energy_track.length > 20000) energy_stat.energy_track.pop();
            if(energy_stat.energy_track.length >= 20) energy_stat["10_tick_sum_trend"] = (energy_stat["10_tick_sum_a"] - energy_stat["10_tick_sum_b"]) / 10;
            if(energy_stat.energy_track.length >= 200) energy_stat["100_tick_sum_trend"] = (energy_stat["100_tick_sum_a"] - energy_stat["100_tick_sum_b"]) / 100;
            if(energy_stat.energy_track.length >= 1000) energy_stat["500_tick_sum_trend"] = (energy_stat["500_tick_sum_a"] - energy_stat["500_tick_sum_b"]) / 500;
            if(energy_stat.energy_track.length >= 2000) energy_stat["1000_tick_sum_trend"] = (energy_stat["1000_tick_sum_a"] - energy_stat["1000_tick_sum_b"]) /1000;
            if(energy_stat.energy_track.length >= 20000) energy_stat["10000_tick_sum_trend"] = (energy_stat["10000_tick_sum_a"] - energy_stat["10000_tick_sum_b"]) /10000;
            console.log("[" + spawn_name + " Energy Log]Energy:" + energy,
                        "10Tick:" + energy_stat["10_tick_sum_trend"],
                        "100Tick:" + energy_stat["100_tick_sum_trend"],
                        "500Tick:" + energy_stat["500_tick_sum_trend"],
                        "1000Tick:" + energy_stat["1000_tick_sum_trend"],
                        "10000Tick:" + energy_stat["10000_tick_sum_trend"]);
        }
        ///////////////////////////////////////////////////////////////////////
        ////    CPU Stat
        var cpu_stat = Memory.Room[room_name].cpu_stat;
        cpu_stat.cpu_track.unshift(Game.cpu.getUsed().toFixed(3));
        cpu_stat["10000_tick_sum"] += parseFloat(cpu_stat.cpu_track[0]);
        if(cpu_stat.cpu_track.length > 10000) {
            cpu_stat["10000_tick_sum"] -= parseFloat(cpu_stat.cpu_track[10000]);
        }
        while(cpu_stat.cpu_track.length > 10000) cpu_stat.cpu_track.pop();
        cpu_stat["10000_tick_avg"] = (parseFloat(cpu_stat["10000_tick_sum"]) / cpu_stat.cpu_track.length).toFixed(3);
        console.log("[Cpu Log]Time:" + Game.time % 10000,
                    "UsedCpu:" + cpu_stat.cpu_track[cpu_stat.cpu_track.length - 1],
                    "AvgUsedCpu:" + cpu_stat["10000_tick_avg"],
                    "Bucket:" + Game.cpu.bucket);
        ///////////////////////////////////////////////////////////////////////
        ////    Adjust Worker Number
        Memory.CreepStat.Miner.max_num = 0;
        Memory.CreepStat.Carrier.max_num = 0;
        Memory.CreepStat.Refueler.max_num = 0;
        for(var room_name in Memory.Room) {
            var room = Game.rooms[room_name];
            Memory.CreepStat.Miner.max_num += Memory.Room[room_name].container_list.length;
            Memory.CreepStat.Carrier.max_num += Memory.CreepStat.Miner.name_list.length;
            if(Memory.Room[room_name].storage_list.length > 0) {
                Memory.CreepStat.Refueler.max_num = Memory.Room[room_name].tower_list.length;
            }
            for(var source_id in Memory.Room[room_name].source) {
                console.log("source_id", source_id)
                var source_info = Memory.Room[room_name].source[source_id];
                console.log("assigned_miner", source_info.assigned_miner)
                if(source_info.assigned_miner == null || Game.creeps[source_info.assigned_miner] == null) {
                    Memory.Room[room_name].source[source_id].assigned_miner == null;
                    for(var i in Memory.CreepStat.Miner.name_list) {
                        var miner_name = Memory.CreepStat.Miner.name_list[i];
                        console.log("check miner", miner_name, Memory.creeps[miner_name].target_id)
                        if(Memory.creeps[miner_name].target_id == null) {
                            console.log("assign", miner_name)
                            Memory.creeps[miner_name].target_id = source_id;
                            Memory.creeps[miner_name].container_id = source_info.container;
                            Memory.Room[room_name].source[source_id].assigned_miner = miner_name;
                            break;
                        }
                    }
                }
            }
        }
        var first_room_name = Game.spawns["Spawn1"].room.name;
        var first_room = Game.rooms[room_name];
        if(Memory.CreepStat.Carrier.name_list.length == 0) {
            Memory.CreepStat.Harvester.max_num = Object.keys(Memory.Room[first_room_name].source).length;
        }
        else {
            Memory.CreepStat.Harvester.max_num = 0;
        }
        Memory.CreepStat.Builder.max_num = 1;
        if(Memory.CreepStat.Upgrader.name_list.length < Memory.CreepStat.Upgrader.max_num
                && Memory.Room[first_room_name].energy_stat["1000_tick_sum_trend"] < 0) {
            Memory.CreepStat.Upgrader.max_num = parseInt(Memory.CreepStat.Upgrader.max_num / 2);
            if(Memory.CreepStat.Upgrader.max_num == 0) {
                Memory.CreepStat.Upgrader.max_num = 1;
            }
        }
        else if(Memory.CreepStat.Upgrader.name_list.length == Memory.CreepStat.Upgrader.max_num
                && Memory.Spawn["Spawn1"].spawn_cool_down == 0) {
            if(Memory.CreepStat.Upgrader.max_num == 0) {
                Memory.CreepStat.Upgrader.max_num = 1;
            }
            if(Memory.Room[first_room_name].cpu_stat["10000_tick_avg"] < 15
                    && (Memory.Room[first_room_name].energy_stat["1000_tick_sum_trend"] > 50
                        || first_room.energyAvailable > 800000)
                    && Memory.CreepStat.Upgrader.max_num < first_room.controller.level) {
                Memory.CreepStat.Upgrader.max_num += 1;
            }
            else if((Memory.Room[first_room_name].cpu_stat["10000_tick_avg"] > 15
                    || Memory.Room[first_room_name].cpu_stat["10000_tick_avg"] < 0)
                    && Memory.CreepStat.Upgrader.max_num > 1) {
                Memory.CreepStat.Upgrader.max_num -= 1;
            }
        }
    }
};

module.exports = stat;
