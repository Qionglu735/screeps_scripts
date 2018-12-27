
//ATTACK 80 RANGED_ATTACK 150 HEAL 250 CLAIM 600
//TOUGH 10 MOVE 50

//role.Guard, role.Scout

var spawnMilitary = {
    run:function(spawn, room) {
        //if(true) {return;}
        
        //Type.A, Type.R, Type.H, Type.AR, Type.AT, Type.RT
        var MilitaryCreeps = [1, 1, 1];
        if(spawn.spawning == null){
            var warriors = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeA');
            var archers = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeR');
            var healers = _.filter(Game.creeps, (creep) => creep.memory.type == 'TypeH');
            var extensionNum = room.find(FIND_STRUCTURES, {filter: (target)=>target.structureType == STRUCTURE_EXTENSION}).length;
            
            if(warriors.length < MilitaryCreeps[0]) {
                if(room.energyAvailable >= 1750) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv28');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv28', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1500) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv23');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv23', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1250) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv18');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv18', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1000) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv13');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv13', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 750) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv9');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv9', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 500) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv4');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,
                                        ATTACK,ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv4', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 250) {
                    console.log('Spawning: ' + 'TypeA' + Game.time + 'Lv0');
                    spawn.spawnCreep([TOUGH,TOUGH,
                                        ATTACK,
                                        MOVE,MOVE,MOVE],
                                        'TypeA' + Game.time + 'Lv0', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeA',
                                                destination: ''}});
                }
            }
            else if(archers.length < MilitaryCreeps[1]) {
                if(room.energyAvailable >= 1820) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv31');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv31', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1560) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv26');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv26', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1300) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv20');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv20', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1040) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv15');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv15', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 780) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv10');
                    spawn.spawnCreep([TOUGH,TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv10', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 520) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv5');
                    spawn.spawnCreep([TOUGH,TOUGH,
                                        RANGED_ATTACK,RANGED_ATTACK,
                                        MOVE,MOVE,MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv5', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 260) {
                    console.log('Spawning: ' + 'TypeR' + Game.time + 'Lv0');
                    spawn.spawnCreep([TOUGH,
                                        RANGED_ATTACK,
                                        MOVE,MOVE],
                                        'TypeR' + Game.time + 'Lv0', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeR',
                                                destination: ''}});
                }
            }
            else if(healers.length < MilitaryCreeps[2]) {
                if(room.energyAvailable >= 1800) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv30');
                    spawn.spawnCreep([HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
                                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeH' + Game.time + 'Lv30', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1500) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv24');
                    spawn.spawnCreep([HEAL,HEAL,HEAL,HEAL,HEAL,
                                        MOVE,MOVE,MOVE,MOVE,MOVE],
                                        'TypeH' + Game.time + 'Lv24', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 1200) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv18');
                    spawn.spawnCreep([HEAL,HEAL,HEAL,HEAL,
                                        MOVE,MOVE,MOVE,MOVE],
                                        'TypeH' + Game.time + 'Lv18', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 900) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv12');
                    spawn.spawnCreep([HEAL,HEAL,HEAL,
                                        MOVE,MOVE,MOVE],
                                        'TypeH' + Game.time + 'Lv12', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 600) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv6');
                    spawn.spawnCreep([HEAL,HEAL,
                                        MOVE,MOVE],
                                        'TypeH' + Game.time + 'Lv6', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
                else if(room.energyAvailable >= 300) {
                    console.log('Spawning: ' + 'TypeH' + Game.time + 'Lv0');
                    spawn.spawnCreep([HEAL,
                                        MOVE],
                                        'TypeH' + Game.time + 'Lv0', {
                                            memory: {
                                                role: 'Guard',
                                                type: 'TypeH',
                                                destination: ''}});
                }
            }
        }
    }
}

module.exports = spawnMilitary
