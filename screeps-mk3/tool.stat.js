
let stat = function() {
    ///////////////////////////////////////////////////////////////////////
    ////    Energy Stat
    for(let room_name of Memory.main_room_list) {
        let energy_stat = Memory.room_dict[room_name].energy_stat;
        let energy = Memory.room_dict[room_name].energyAvailable;
        if(!energy) energy = 0;
        for(let i of Memory.room_dict[room_name].container_list) {
            let obj = Game.getObjectById(i);
            if(obj != null && obj.structureType === STRUCTURE_CONTAINER && obj.progress == null){
                energy += obj.store[RESOURCE_ENERGY];
            }
        }
        for(let i of Memory.room_dict[room_name].storage_list) {
            let obj = Game.getObjectById(i);
            if(obj != null && obj.structureType === STRUCTURE_STORAGE && obj.progress == null) {
                energy += obj.store[RESOURCE_ENERGY];
            }
        }
        // ////  reset
        // for(let i in energy_stat) {
        //     if(energy_stat.hasOwnProperty(i)) {
        //         delete energy_stat[i];
        //     }
        // }
        if(energy_stat.energy_track == null) energy_stat.energy_track = [];
        energy_stat.energy_track.unshift(energy);
        if(energy_stat.energy_track.length > 0) {
            if(energy_stat["10_tick_sum_a"] == null) energy_stat["10_tick_sum_a"] = 0;
            if(energy_stat["10_tick_sum_b"] == null) energy_stat["10_tick_sum_b"] = 0;
            if(energy_stat["60_tick_sum_a"] == null) energy_stat["60_tick_sum_a"] = 0;
            if(energy_stat["60_tick_sum_b"] == null) energy_stat["60_tick_sum_b"] = 0;
            if(energy_stat["600_tick_sum_a"] == null) energy_stat["600_tick_sum_a"] = 0;
            if(energy_stat["600_tick_sum_b"] == null) energy_stat["600_tick_sum_b"] = 0;
            if(energy_stat["3600_tick_sum_a"] == null) energy_stat["3600_tick_sum_a"] = 0;
            if(energy_stat["3600_tick_sum_b"] == null) energy_stat["3600_tick_sum_b"] = 0;
            if(energy_stat["36000_tick_sum_a"] == null) energy_stat["36000_tick_sum_a"] = 0;
            if(energy_stat["36000_tick_sum_b"] == null) energy_stat["36000_tick_sum_b"] = 0;
            energy_stat["10_tick_sum_a"] += energy_stat.energy_track[0];
            energy_stat["60_tick_sum_a"] += energy_stat.energy_track[0];
            energy_stat["600_tick_sum_a"] += energy_stat.energy_track[0];
            energy_stat["3600_tick_sum_a"] += energy_stat.energy_track[0];
            energy_stat["36000_tick_sum_a"] += energy_stat.energy_track[0];
        }
        if(energy_stat.energy_track.length > 10) {
            energy_stat["10_tick_sum_a"] -= energy_stat.energy_track[10];
            energy_stat["10_tick_sum_b"] += energy_stat.energy_track[10];
        }
        if(energy_stat.energy_track.length > 20) {
            energy_stat["10_tick_sum_b"] -= energy_stat.energy_track[20];
        }
        if(energy_stat.energy_track.length > 60) {
            energy_stat["60_tick_sum_a"] -= energy_stat.energy_track[60];
            energy_stat["60_tick_sum_b"] += energy_stat.energy_track[60];
        }
        if(energy_stat.energy_track.length > 120) {
            energy_stat["60_tick_sum_b"] -= energy_stat.energy_track[120];
        }
        if(energy_stat.energy_track.length > 600) {
            energy_stat["600_tick_sum_a"] -= energy_stat.energy_track[600];
            energy_stat["600_tick_sum_b"] += energy_stat.energy_track[600];
        }
        if(energy_stat.energy_track.length > 1200) {
            energy_stat["600_tick_sum_b"] -= energy_stat.energy_track[1200];
        }
        if(energy_stat.energy_track.length > 3600) {
            energy_stat["3600_tick_sum_a"] -= energy_stat.energy_track[3600];
            energy_stat["3600_tick_sum_b"] += energy_stat.energy_track[3600];
        }
        if(energy_stat.energy_track.length > 7200) {
            energy_stat["3600_tick_sum_b"] -= energy_stat.energy_track[7200];
        }
        if(energy_stat.energy_track.length > 36000) {
            energy_stat["36000_tick_sum_a"] -= energy_stat.energy_track[36000];
            energy_stat["36000_tick_sum_b"] += energy_stat.energy_track[36000];
        }
        if(energy_stat.energy_track.length > 72000) {
            energy_stat["36000_tick_sum_b"] -= energy_stat.energy_track[72000];
        }
        while(energy_stat.energy_track.length > 72000) energy_stat.energy_track.pop();
        energy_stat["10_tick_sum_trend"] = ((energy_stat["10_tick_sum_a"] - energy_stat["10_tick_sum_b"]) / 10).toFixed(3);
        energy_stat["60_tick_sum_trend"] = ((energy_stat["60_tick_sum_a"] - energy_stat["60_tick_sum_b"]) / 60).toFixed(3);
        energy_stat["600_tick_sum_trend"] = ((energy_stat["600_tick_sum_a"] - energy_stat["600_tick_sum_b"]) / 600).toFixed(3);
        energy_stat["3600_tick_sum_trend"] = ((energy_stat["3600_tick_sum_a"] - energy_stat["3600_tick_sum_b"]) / 3600).toFixed(3);
        energy_stat["36000_tick_sum_trend"] = ((energy_stat["36000_tick_sum_a"] - energy_stat["36000_tick_sum_b"]) / 36000).toFixed(3);
        let room = Game.rooms[room_name];
        console.log("[" + room_name + " Log]" +
            "Lv:" + room.controller.level + "(" +
            (room.controller.progress / room.controller.progressTotal * 100).toFixed(4) + "%)",
            room.controller.progress - Memory.room_dict[room_name].controller_progress,
            "Energy:" + energy,
            "10s:" + energy_stat["10_tick_sum_trend"],
            "1m:" + energy_stat["60_tick_sum_trend"],
            "10m:" + energy_stat["600_tick_sum_trend"],
            "1h:" + energy_stat["3600_tick_sum_trend"],
            "10h:" + energy_stat["36000_tick_sum_trend"]);
        Memory.room_dict[room_name].controller_progress = room.controller.progress;
    }
    ///////////////////////////////////////////////////////////////////////
    ////    CPU Stat
    let cpu_stat = Memory.cpu_stat;
    cpu_stat.cpu_track.unshift(Game.cpu.getUsed().toFixed(3));
    if(cpu_stat.cpu_track.length > 0) {
        if(cpu_stat["60_tick_sum"] == null) cpu_stat["60_tick_sum"] = 0;
        if(cpu_stat["600_tick_sum"] == null) cpu_stat["600_tick_sum"] = 0;
        if(cpu_stat["3600_tick_sum"] == null) cpu_stat["3600_tick_sum"] = 0;
        cpu_stat["60_tick_sum"] += parseFloat(cpu_stat.cpu_track[0]);
        cpu_stat["600_tick_sum"] += parseFloat(cpu_stat.cpu_track[0]);
        cpu_stat["3600_tick_sum"] += parseFloat(cpu_stat.cpu_track[0]);
    }
    if(cpu_stat.cpu_track.length > 60) {
        cpu_stat["60_tick_sum"] -= parseFloat(cpu_stat.cpu_track[60]);
    }
    if(cpu_stat.cpu_track.length > 600) {
        cpu_stat["600_tick_sum"] -= parseFloat(cpu_stat.cpu_track[600]);
    }
    if(cpu_stat.cpu_track.length > 3600) {
        cpu_stat["3600_tick_sum"] -= parseFloat(cpu_stat.cpu_track[3600]);
    }
    while(cpu_stat.cpu_track.length > 3600) cpu_stat.cpu_track.pop();
    if(cpu_stat.cpu_track.length > 60) {
        cpu_stat["60_tick_avg"] = (parseFloat(cpu_stat["60_tick_sum"]) / 60).toFixed(3);
    }
    else {
        cpu_stat["60_tick_avg"] = (parseFloat(cpu_stat["60_tick_sum"]) / cpu_stat.cpu_track.length).toFixed(3);
    }
    if(cpu_stat.cpu_track.length > 600) {
        cpu_stat["600_tick_avg"] = (parseFloat(cpu_stat["600_tick_sum"]) / 600).toFixed(3);
    }
    else {
        cpu_stat["600_tick_avg"] = (parseFloat(cpu_stat["600_tick_sum"]) / cpu_stat.cpu_track.length).toFixed(3);
    }
    cpu_stat["3600_tick_avg"] = (parseFloat(cpu_stat["3600_tick_sum"]) / cpu_stat.cpu_track.length).toFixed(3);
    console.log("[Cpu Log]Time:" + Game.time % 10000,
        "UsedCpu:" + cpu_stat.cpu_track[0],
        "1m:" + cpu_stat["60_tick_avg"],
        "10m:" + cpu_stat["600_tick_avg"],
        "1h:" + cpu_stat["3600_tick_avg"],
        "Bucket:" + Game.cpu.bucket);
};

module.exports = stat;
