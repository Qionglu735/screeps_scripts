
var roleGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.type == 'TypeA') {
            var target = creep.room.find(FIND_HOSTILE_CREEPS, {
                                        filter: (creep) => creep.getActiveBodyparts(ATTACK) != 0 ||
                                                            creep.getActiveBodyparts(RANGED_ATTACK) != 0 ||
                                                            creep.getActiveBodyparts(CLAIM) != 0 ||
                                                            creep.getActiveBodyparts(HEAL) != 0})[0];
            if(target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                creep.moveTo(Game.flags['GuardPark'], {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if(creep.memory.type == 'TypeR') {
            var target = creep.room.find(FIND_HOSTILE_CREEPS, {
                                        filter: (creep) => creep.getActiveBodyparts(ATTACK) != 0 ||
                                                            creep.getActiveBodyparts(RANGED_ATTACK) != 0 ||
                                                            creep.getActiveBodyparts(CLAIM) != 0 ||
                                                            creep.getActiveBodyparts(HEAL) != 0})[0];
            if(target) {
                if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
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
                var targets = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                                                    filter: (creep) => creep.hit < creep.hitMax});
                if(targets) {
                    if(creep.rangedHeal(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
                else {
                    creep.moveTo(Game.flags['GuardPark'], {visualizePathStyle: {stroke: '#00ff00'}});
                }
            }
        }
    }
};

module.exports = roleGuard;
