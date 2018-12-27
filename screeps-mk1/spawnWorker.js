
var spawnWorker = {
    run: function(spawn, room) {
        //Harvester, Upgrader, Builder, Miner, Carrier
        var WorkerCreeps = [[0, 0, 0, 0, 0],  //BaseLine
                            [2, 2, 0, 0, 0],  //RCL = 1
                            [2, 3, 3, 2, 0], //RCL = 2
                            [0, 5, 5, 2, 5], //RCL = 3
                            [0, 3, 3, 2, 5], //RCL = 4
                            [0, 3, 3, 2, 5], //RCL = 5
        ];
        if(spawn.spawning == null) {
            var Harvesters = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Harvester'});
            var Upgraders = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Upgrader'});
            var Builders = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Builder'});
            var Miners = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Miner'});
            var Carriers = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'Carrier'});
            var extensionNum = room.find(FIND_MY_STRUCTURES, {filter: (target)=>target.structureType == STRUCTURE_EXTENSION}).length;
            console.log("Harvester:" + Harvesters.length, "Upgrader:" + Upgraders.length, "Builder:" + Builders.length,
                            "Miner:" + Miners.length, "Carrier:" + Carriers.length, "Energy:" + room.energyAvailable);
            //console.log("Extension:" + extensionNum, "Energy:" + room.energyAvailable);
            //BaseLine
            /*
            if((Harvesters.length < WorkerCreeps[0][0] ||
                    Harvesters.length < WorkerCreeps[room.controller.level][0] / 2) &&
                    room.energyAvailable >= 200) {
                console.log('Spawning: ' + 'Harvester' + Game.time + 'Lv0');
                spawn.spawnCreep([WORK,CARRY,MOVE],
                                    'Harvester' + Game.time + 'Lv0', {
                                        memory: {
                                            role: 'Harvester',
                                            target_id: '',
                                            harvesting: false}});
            }
            else if((Upgraders.length < WorkerCreeps[0][2] ||
                        Upgraders.length < WorkerCreeps[room.controller.level][1] / 2) &&
                        room.energyAvailable >= 200) {
                console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv0');
                spawn.spawnCreep([WORK,CARRY,MOVE],
                                    'Upgrader' + Game.time + 'Lv0', {
                                        memory: {
                                            role: 'Upgrader',
                                            target_id: '',
                                            upgrading: true}});
            }
            else if((Builders.length < WorkerCreeps[0][1] ||
                        Builders.length < WorkerCreeps[room.controller.level][2] / 2) &&
                        room.energyAvailable >= 200) {
                console.log('Spawning: ' + 'Builder' + Game.time + 'Lv0');
                spawn.spawnCreep([WORK,CARRY,MOVE],
                                    'Builder' + Game.time + 'Lv0', {
                                        memory: {
                                            role: 'Builder',
                                            target_id: '',
                                            building: true}});
            }
            */
            //Harvester
            if(Harvesters.length < WorkerCreeps[room.controller.level][0]) {
                if(room.energyAvailable >= 600 ) {
                    console.log('Spawning: ' + 'Harvester' + Game.time + 'Lv6');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Harvester' + Game.time + 'Lv3', {
                                                memory: {
                                                    role: 'Harvester',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 400 ) {
                    console.log('Spawning: ' + 'Harvester' + Game.time + 'Lv2');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Harvester' + Game.time + 'Lv1', {
                                                memory: {
                                                    role: 'Harvester',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 200 ) {
                    console.log('Spawning: ' + 'Harvester' + Game.time + 'Lv0');
                    spawn.spawnCreep([WORK,CARRY,MOVE],
                                            'Harvester' + Game.time + 'Lv0', {
                                                memory: {
                                                    role: 'Harvester',
                                                    target_id: '',
                                                    harvesting: false}});
                }
            }
            //Miner
            else if(Miners.length < WorkerCreeps[room.controller.level][3]) {
                if(room.energyAvailable >= 1750 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv29');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,
                                        WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv29', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 1500 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv24');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,
                                        WORK,WORK,MOVE,WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv24', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 1250 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv19');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,
                                        WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv19', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 1000 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv14');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv14', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 750 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv9');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv9', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 500 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv4');
                    spawn.spawnCreep([WORK,WORK,MOVE,WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv4', {
                                                memory: {
                                                    role: 'Miner'}});
                }
                else if(room.energyAvailable >= 250 ) {
                    console.log('Spawning: ' + 'Miner' + Game.time + 'Lv0');
                    spawn.spawnCreep([WORK,WORK,MOVE],
                                            'Miner' + Game.time + 'Lv0', {
                                                memory: {
                                                    role: 'Miner'}});
                }
            }
            //Carrier
            else if(Carriers.length < WorkerCreeps[room.controller.level][4]) {
                if(room.energyAvailable >= 1800 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv30');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv30', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 1600 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv26');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv26', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 1400 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv22');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv22', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 1200 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv18');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv18', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 1000 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv14');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv14', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 800 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv10');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,
                                        CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv10', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 600 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv6');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv6', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 400 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv2');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv2', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
                else if(room.energyAvailable >= 200 ) {
                    console.log('Spawning: ' + 'Carrier' + Game.time + 'Lv0');
                    spawn.spawnCreep([CARRY,CARRY,MOVE,MOVE],
                                            'Carrier' + Game.time + 'Lv0', {
                                                memory: {
                                                    role: 'Carrier'}});
                }
            }
            //Upgrader
            else if(Upgraders.length < WorkerCreeps[room.controller.level][1]) {
                if(room.energyAvailable >= 1800 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv30');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv30', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1600 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv26');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv26', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1400 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv22');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv22', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1200 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv18');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv18', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1000 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv14');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv14', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 800 ) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv10');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv10', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    upgrading: true}});
                }
                else if(room.energyAvailable >= 600) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv6');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv6', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    upgrading: true}});
                }
                else if(room.energyAvailable >= 400) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv2');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv2', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    upgrading: true}});
                }
                else if(room.energyAvailable >= 200) {
                    console.log('Spawning: ' + 'Upgrader' + Game.time + 'Lv0');
                    spawn.spawnCreep([WORK,CARRY,MOVE],
                                            'Upgrader' + Game.time + 'Lv0', {
                                                memory: {
                                                    role: 'Upgrader',
                                                    target_id: '',
                                                    upgrading: true}});
                }
            }
            //Builder
            else if(Builders.length < WorkerCreeps[room.controller.level][2] && room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
                if(room.energyAvailable >= 1800 ) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv30');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVEWORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv30', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                
                if(room.energyAvailable >= 1600 ) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv26');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVEWORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv26', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                
                if(room.energyAvailable >= 1400 ) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv22');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv22', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1200 ) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv18');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv18', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    harvesting: false}});
                }
                else if(room.energyAvailable >= 1000 ) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv14');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,
                                        WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv14', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    building: true}});
                }
                else if(room.energyAvailable >= 800) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv10');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv10', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    building: true}});
                }
                else if(room.energyAvailable >= 600) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv6');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv6', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    building: true}});
                }
                else if(room.energyAvailable >= 400) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv2');
                    spawn.spawnCreep([WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv2', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    building: true}});
                }
                else if(room.energyAvailable >= 200) {
                    console.log('Spawning: ' + 'Builder' + Game.time + 'Lv0');
                    spawn.spawnCreep([WORK,CARRY,MOVE],
                                            'Builder' + Game.time + 'Lv0', {
                                                memory: {
                                                    role: 'Builder',
                                                    target_id: '',
                                                    building: true}});
                }
            }
            else{
                return false;
            }
        }
    }
};

module.exports = spawnWorker;
