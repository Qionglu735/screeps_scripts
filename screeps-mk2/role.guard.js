
var globalFind = require("tool.globalFind");

var roleGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.type == 'TypeA') {
            var target = globalFind.find(FIND_HOSTILE_CREEPS, {
                                        filter: (creep) => creep.getActiveBodyparts(MOVE) != 0
                                            || creep.getActiveBodyparts(ATTACK) != 0
                                            || creep.getActiveBodyparts(RANGED_ATTACK) != 0
                                            || creep.getActiveBodyparts(CLAIM) != 0
                                            || creep.getActiveBodyparts(HEAL) != 0})[0];
            if(target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
            else if(creep.ticksToLive < 1300) {
                creep.moveTo(Game.spawns[Memory.Spawns[0].name], {visualizePathStyle: {stroke: '#ff0000'}});
            }
            else {
                creep.moveTo(Game.flags['GuardPark'], {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if(creep.memory.type == 'TypeR') {
            var target = globalFind.find(FIND_HOSTILE_CREEPS, {
                                        filter: (creep) => creep.getActiveBodyparts(MOVE) != 0
                                            || creep.getActiveBodyparts(ATTACK) != 0
                                            || creep.getActiveBodyparts(RANGED_ATTACK) != 0
                                            || creep.getActiveBodyparts(CLAIM) != 0
                                            || creep.getActiveBodyparts(HEAL) != 0})[0];
            if(target) {
                if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }
            else if(creep.ticksToLive < 1300) {
                creep.moveTo(Game.spawns[Memory.Spawns[0].name], {visualizePathStyle: {stroke: '#0000ff'}});
            }
            else {
                creep.moveTo(Game.flags['GuardPark'], {visualizePathStyle: {stroke: '#0000ff'}});
            }
        }
        else if(creep.memory.type == 'TypeH') {
            if(creep.hit < creep.hitMax) {
                creep.heal(creep);
            }
            else {
                var target = globalFind.find(FIND_MY_CREEPS, {
                                                filter: (target) => target.name == creep.memory.targetName});
                if(target && target.hits == target.hitsMax) {
                    target = null;
                    creep.memory.targetName = '';
                }
                if(!target) {
                    var targets = globalFind.find(FIND_MY_CREEPS, {
                                                        filter: (creep) => creep.hits < creep.hitsMax});
                    if(targets.length > 0) {
                        target = targets[0];
                    }
                }
                if(target) {
                    creep.memory.targetName = target.name;
                    if(creep.heal(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#00ff00'}});
                        creep.rangedHeal(targets[0]);
                    }
                }
                else if(creep.ticksToLive < 1300) {
                    creep.moveTo(Game.spawns[Memory.Spawns[0].name], {visualizePathStyle: {stroke: '#ff0000'}});
                }
                else {
                    creep.moveTo(Game.flags['GuardPark'], {visualizePathStyle: {stroke: '#00ff00'}});
                }
            }
        }
    }
};

module.exports = roleGuard;
