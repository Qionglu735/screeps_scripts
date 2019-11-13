


var mine_port_check = require('tool.mine_port_check');

module.exports.loop = function() {

    ////    Loop Control
    ////    Memory.LoopControl: -1 == normal, 0 == pause, N(N>0) == N step
    ////    Use console to set value: Memory.LoopControl = 0
    if(typeof Memory.LoopControl == "undefined") {
        Memory.LoopControl = 0;
    }
    if(Memory.LoopControl == 0) {
        return;
    }
    if(Memory.LoopControl > 0) {
        Memory.LoopControl -= 1;
    }

    ////    Memory Control
    ////    Memory.MemoryControl: 0 == normal, 1 == reset
    ////    Use console to set value: Memory.MemoryControl = 1
    if(typeof Memory.MemoryControl == "undefined") {
        Memory.MemoryControl = 1;
    }
    if(Memory.MemoryControl == 1 && Game.spawns["Spawn1"]) {
        Memory.MemoryControl = 0;
        //// init memory
        Memory.Spawn = {
            "Spawn1": {
                "creep_spawn_list": []
            }
        };
        Memory.Room = {};
        Memory.Room[Game.spawns["Spawn1"].room.name] = {
            "source": {},
            "mine": {},
            "claim_status": "claimed"
        };
        mine_port_check.run(Game.spawns["Spawn1"].room.name);
        Memory.CreepStat = {
            "harvester": {
                "name_list": [],
                "max_num": 0
            },
            "upgrader": {
                "name_list": [],
                "max_num": 0
            },
            "builder": {
                "name_list": [],
                "max_num": 0
            },
            "miner": {
                "name_list": [],
                "max_num": 0
            },
            "carrier": {
                "name_list": [],
                "max_num": 0
            },
            "refueler": {
                "name_list": [],
                "max_num": 0
            },
            "claimer": {
                "name_list": [],
                "max_num": 0
            }
        };
    }

    ////    Check Creeps
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            switch(Memory.creeps[name].role) {
                case "miner":
                    // TODO: remove source/mine assigned mark
                    break;
                case "claimer":
                    if(Memory.RoomsToClaim[Memory.creeps[name].targetRoomID] == 2) {  // reversing
                        Memory.RoomsToClaim[Memory.creeps[name].targetRoomID] = 1;  // to reverse
                    }
                    break;
            }
            var _index = Memory.CreepStat[role].name_list.indexOf(name);
            if(index != -1) Memory.CreepStat[role].name_list.splice(_index, 1);
            delete Memory.creeps[name];
            console.log(name + " passed away.");
        }
    }

    // TODO: run spawn

    // TODO: run tower

    for(var name in Memory.creeps) {
        switch(Memory.creeps[name].role) {
            case "harvester":
                break;
            case "upgrader":
                break;
            case "builder":
                break;
            case "miner":
                break;
            case "carrier":
                break;
            case "refueler":
                break;
            case "claimer":
                break;
        }
    }



}

var DataStruct = function() {
    Memory.Room = {
        "ROOM_NAME_1": {
            "source": {
                "SOURCE_ID_1": {
                    "mine_port": {
                        "x": "X_1",
                        "y": "Y_1"
                    },
                    "assigned_miner": "MINER_NAME_1"
                },
                "SOURCE_ID_2": {
                    "mine_port": {
                        "x": "X_2",
                        "y": "Y_2"
                    },
                    "assigned_miner": "MINER_NAME_2"
                }
            },
            "mineral": {
                "MINE_ID_1": {
                    "assigned_miner": "MINER_NAME_1"
                }
            },
            "claim_status": "neutral/to_reverse/reversing/to_claim/claiming/claimed"
        }
    };
    Memory.Spawn = {
        "SPAWN_NAME_1": {
            "creep_spawn_list": ["harvester", "builder"]
        }
    };
    Memory.CreepStat = {
        "harvester": {
            "name_list": [],
            "max_num": 0
        },
        "builder": {
            "name_list": [],
            "max_num": 0
        }
    }
}