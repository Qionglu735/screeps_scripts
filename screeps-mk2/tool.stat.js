
var globalFind = require("tool.globalFind");

var stat = {
    run: function(room) {
        
        var storage = room.find(FIND_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_STORAGE});
        var container = room.find(FIND_STRUCTURES, {filter: (target) => target.structureType == STRUCTURE_CONTAINER});
        var energy = room.energyAvailable;
        var i = 0;
        while(i < storage.length) {
            energy += storage[i].store[RESOURCE_ENERGY];
            i += 1;
        }
        i = 0;
        while(i < container.length) {
            energy += container[i].store[RESOURCE_ENERGY];
            i += 1;
        }   
        if(typeof Memory.EnergyTrack == "undefined") {
            Memory.EnergyTrack = [];
            Memory.Energy10TickSum1 = 0, Memory.Energy100TickSum1 = 0, Memory.Energy500TickSum1 = 0, Memory.Energy1000TickSum1 = 0, Memory.Energy10000TickSum1 = 0;
            Memory.Energy10TickSum2 = 0, Memory.Energy100TickSum2 = 0, Memory.Energy500TickSum2 = 0, Memory.Energy1000TickSum2 = 0, Memory.Energy10000TickSum2 = 0;
            Memory.Energy10TickTrend = 0, Memory.Energy100TickTrend = 0, Memory.Energy500TickTrend = 0, Memory.Energy1000TickTrend = 0, Memory.Energy10000TickTrend = 0;
        }
        Memory.EnergyTrack.unshift(energy);
        if(Memory.EnergyTrack.length < 20000) {
            var sum101 = 0, sum1001 = 0, sum5001 = 0, sum10001 = 0, sum100001 = 0;
            var sum102 = 0, sum1002 = 0, sum5002 = 0, sum10002 = 0, sum100002 = 0;
            var i = 0
            while(i < Memory.EnergyTrack.length) {
                if(0 <= i && i < 10) sum101 += Memory.EnergyTrack[i];
                if(10 <= i && i < 20) sum102 += Memory.EnergyTrack[i];
                if(0 <= i && i < 100) sum1001 += Memory.EnergyTrack[i];
                if(100 <= i && i < 200) sum1002 += Memory.EnergyTrack[i];
                if(0 <= i && i < 500) sum5001 += Memory.EnergyTrack[i];
                if(500 <= i && i < 1000) sum5002 += Memory.EnergyTrack[i];
                if(0 <= i && i < 1000) sum10001 += Memory.EnergyTrack[i];
                if(1000 <= i && i < 2000) sum10002 += Memory.EnergyTrack[i];
                if(0 <= i && i < 10000) sum100001 += Memory.EnergyTrack[i];
                if(10000 <= i && i < 20000) sum100002 += Memory.EnergyTrack[i];
                i += 1;
            }
            Memory.Energy10TickSum1 = sum101, Memory.Energy100TickSum1 = sum1001, Memory.Energy500TickSum1 = sum5001, Memory.Energy1000TickSum1 = sum10001, Memory.Energy10000TickSum1 = sum100001;
            Memory.Energy10TickSum2 = sum102, Memory.Energy100TickSum2 = sum1002, Memory.Energy500TickSum2 = sum5002, Memory.Energy1000TickSum2 = sum10002, Memory.Energy10000TickSum2 = sum100002;
        }
        else {
            Memory.Energy10TickSum1 = Memory.Energy10TickSum1 + Memory.EnergyTrack[0] - Memory.EnergyTrack[10];
            Memory.Energy10TickSum2 = Memory.Energy10TickSum2 + Memory.EnergyTrack[10] - Memory.EnergyTrack[20];
            Memory.Energy100TickSum1 = Memory.Energy100TickSum1 + Memory.EnergyTrack[0] - Memory.EnergyTrack[100];
            Memory.Energy100TickSum2 = Memory.Energy100TickSum2 + Memory.EnergyTrack[100] - Memory.EnergyTrack[200];
            Memory.Energy500TickSum1 = Memory.Energy500TickSum1 + Memory.EnergyTrack[0] - Memory.EnergyTrack[500];
            Memory.Energy500TickSum2 = Memory.Energy500TickSum2 + Memory.EnergyTrack[500] - Memory.EnergyTrack[1000];
            Memory.Energy1000TickSum1 = Memory.Energy1000TickSum1 + Memory.EnergyTrack[0] - Memory.EnergyTrack[1000];
            Memory.Energy1000TickSum2 = Memory.Energy1000TickSum2 + Memory.EnergyTrack[1000] - Memory.EnergyTrack[2000];
            Memory.Energy10000TickSum1 = Memory.Energy10000TickSum1 + Memory.EnergyTrack[0] - Memory.EnergyTrack[10000];
            Memory.Energy10000TickSum2 = Memory.Energy10000TickSum2 + Memory.EnergyTrack[10000] - Memory.EnergyTrack[20000];
            while(Memory.EnergyTrack.length > 20000) {
                Memory.EnergyTrack.pop();
            }
        }
        if(Memory.EnergyTrack.length >= 20) Memory.Energy10TickTrend = (Memory.Energy10TickSum1 - Memory.Energy10TickSum2) / 10;
        if(Memory.EnergyTrack.length >= 200) Memory.Energy100TickTrend = (Memory.Energy100TickSum1 - Memory.Energy100TickSum2) / 100;
        if(Memory.EnergyTrack.length >= 500) Memory.Energy500TickTrend = (Memory.Energy500TickSum1 - Memory.Energy500TickSum2) / 500;
        if(Memory.EnergyTrack.length >= 2000) Memory.Energy1000TickTrend = (Memory.Energy1000TickSum1 - Memory.Energy1000TickSum2) /1000;
        if(Memory.EnergyTrack.length >= 20000) Memory.Energy10000TickTrend = (Memory.Energy10000TickSum1 - Memory.Energy10000TickSum2) /10000;
        console.log("Energy:" + energy,
                    "10Tick:" + Memory.Energy10TickTrend,
                    "100Tick:" + Memory.Energy100TickTrend,
                    "500Tick:" + Memory.Energy500TickTrend,
                    "1000Tick:" + Memory.Energy1000TickTrend,
                    "10000Tick:" + Memory.Energy10000TickTrend);
        //////////////////////////////////////////////////////
        if(typeof Memory.UsedCpu == "undefined") {
            Memory.UsedCpu = [];
            Memory.UsedCpuSum == 0;
            Memory.AvgUsedCpu == 0;
        }
        Memory.UsedCpu.unshift(Game.cpu.getUsed().toFixed(3));
        if(Memory.UsedCpu.length < 300 || Game.time % 10000 == 3001) {
            var sum = 0;
            var i = 0;
            while(i < Memory.UsedCpu.length) {
                sum += parseFloat(Memory.UsedCpu[i]);
                i += 1;
            }
            Memory.UsedCpuSum = sum;
        }
        else {
            Memory.UsedCpuSum = parseFloat(Memory.UsedCpuSum) + parseFloat(Memory.UsedCpu[0]) - parseFloat(Memory.UsedCpu.pop());
        }
        Memory.AvgUsedCpu = (parseFloat(Memory.UsedCpuSum) / Memory.UsedCpu.length).toFixed(3);
        console.log("Time:" + Game.time % 10000,
                    "UsedCpu:" + Memory.UsedCpu[Memory.UsedCpu.length - 1],
                    "AvgUsedCpu:" + Memory.AvgUsedCpu,
                    "Bucket:" + Game.cpu.bucket);
        ///////////////////////////////////////////////////////////////////////////
        if(Memory.UpgraderNum < Memory.MaxUpgrader && Memory.Energy1000TickTrend < 0) {
            Memory.MaxUpgrader = parseInt(Memory.MaxUpgrader / 2);
            if(Memory.MaxUpgrader == 0) {
                Memory.MaxUpgrader = 1;
            }
        }
        else if(Memory.UpgraderNum == Memory.MaxUpgrader && Memory.SpawnCooldown == 0) {
            if(Memory.AvgUsedCpu < 15
                && (Memory.Energy1000TickTrend > 50  || energy > 800000)
                && Memory.MaxUpgrader < room.controller.level) {
                Memory.MaxUpgrader += 1;
            }
            else if((Memory.AvgUsedCpu > 15 || Memory.Energy1000TickTrend < 0)
                && Memory.MaxUpgrader > 1) {
                Memory.MaxUpgrader -= 1;
            }
        }
    }
};

module.exports = stat;
