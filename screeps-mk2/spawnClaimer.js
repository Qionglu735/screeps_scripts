
var globalFind = require("tool.globalFind");

var spawnClaimer = {
    run: function(spawn, room) {
        if(spawn.spawning == null && room.energyAvailable >= 1300 && Memory.SpawnCooldown == 0) {
            //Claimer
            if(Memory.RoomsToClaim.includes(1) || Memory.RoomsToClaim.includes(3)) {
                var body = [];
                body.push(MOVE);
                body.push(MOVE);
                body.push(CLAIM);
                body.push(CLAIM);
                console.log("Spawning: Claimer" + Game.time % 10000 + "Lv" + 2);
                var res = spawn.spawnCreep(body, "Claimer" + Game.time % 10000 + "Lv" + 2, {
                                    memory: {
                                        role: "Claimer",
                                        targetRoomName: '',
                                        targetRoomID: -1
                                    }
                                }
                            );
                if(res != OK) {
                    console.log(res);
                }
                else {
                    Memory.SpawnCooldown = body.length * CREEP_SPAWN_TIME * 3;
                }
            }
            else {
                return false;
            }
        }
    }
};

module.exports = spawnClaimer;
