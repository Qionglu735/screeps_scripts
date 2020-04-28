
var stat = {
    run: function() {
        for(var spawn_name in Memory.Spawn) {
            var room_name = Game.spawns[spawn_name].room.name;
            var energy_stat = Memory.Room[room_name].energy_stat;
            var energy = Game.rooms[room_name].energyAvailable;
            for(var id in Memory.Room[room_name].container_list) {
                var obj = Game.getObjectById(id);
                if(obj.structureType == STRUCTURE_CONTAINER) energy += obj.store[RESOURCE_ENERGY];
            }
            for(var id in Memory.Room[room_name].storage_list) {
                var obj = Game.getObjectById(id);
                if(obj.structureType == STRUCTURE_STORAGE) energy += obj.store[RESOURCE_ENERGY];
            }
            energy_stat.energy_track.unshift(energy);
            if(energy_stat.energy_track.length > 0) {
                energy_stat["10_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["100_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["500_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["1000_tick_sum_a"] += energy_stat.energy_track[0];
                energy_stat["10000_tick_sum_a"] += energy_stat.energy_track[0];
            }
            if(energy_stat.energy_track.length > 10) {
                energy_stat["10_tick_sum_a"] -= energy_stat.energy_track[10];
                energy_stat["10_tick_sum_b"] += energy_stat.energy_track[10];
            }
            if(energy_stat.energy_track.length > 20) {
                energy_stat["10_tick_sum_b"] -= energy_stat.energy_track[20];
            }
            if(energy_stat.energy_track.length > 100) {
                energy_stat["100_tick_sum_a"] -= energy_stat.energy_track[100];
                energy_stat["100_tick_sum_b"] += energy_stat.energy_track[100];
            }
            if(energy_stat.energy_track.length > 200) {
                energy_stat["100_tick_sum_b"] -= energy_stat.energy_track[200];
            }
            if(energy_stat.energy_track.length > 500) {
                energy_stat["500_tick_sum_a"] -= energy_stat.energy_track[500];
                energy_stat["500_tick_sum_b"] += energy_stat.energy_track[500];
            }
            if(energy_stat.energy_track.length > 1000) {
                energy_stat["500_tick_sum_b"] -= energy_stat.energy_track[1000];
                energy_stat["1000_tick_sum_a"] -= energy_stat.energy_track[1000];
                energy_stat["1000_tick_sum_b"] += energy_stat.energy_track[1000];
            }
            if(energy_stat.energy_track.length > 2000) {
                energy_stat["1000_tick_sum_b"] -= energy_stat.energy_track[2000];
            }
            if(energy_stat.energy_track.length > 10000) {
                energy_stat["10000_tick_sum_a"] -= energy_stat.energy_track[10000];
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
        //////////////////////////////////////////////////////
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
        ///////////////////////////////////////////////////////////////////////////
//        if(Memory.UpgraderNum < Memory.MaxUpgrader && Memory.Energy1000TickTrend < 0) {
//            Memory.MaxUpgrader = parseInt(Memory.MaxUpgrader / 2);
//            if(Memory.MaxUpgrader == 0) {
//                Memory.MaxUpgrader = 1;
//            }
//        }
//        else if(Memory.UpgraderNum == Memory.MaxUpgrader && Memory.SpawnCooldown == 0) {
//            if(Memory.AvgUsedCpu < 15
//                && (Memory.Energy1000TickTrend > 50  || energy > 800000)
//                && Memory.MaxUpgrader < room.controller.level) {
//                Memory.MaxUpgrader += 1;
//            }
//            else if((Memory.AvgUsedCpu > 15 || Memory.Energy1000TickTrend < 0)
//                && Memory.MaxUpgrader > 1) {
//                Memory.MaxUpgrader -= 1;
//            }
//        }
    }
};

module.exports = stat;
