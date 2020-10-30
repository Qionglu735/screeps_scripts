
let structure_tower = function(tower) {
    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile) {
        tower.attack(closestHostile);
    }
    else {
        let closestDamagedStructure = tower.pos.findClosestByRange(
            FIND_STRUCTURES, {
                filter: (structure) =>
                    structure.hits < structure.hitsMax
                    && structure.structureType !== STRUCTURE_WALL
                }
            );
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
    }
}

module.exports = structure_tower;
