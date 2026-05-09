
let role_dealer = function(creep) {
    let main_room_memory = Memory.room_dict[creep.memory.main_room];
    if (main_room_memory.storage_list.length == 0 || main_room_memory.terminal_list.length == 0) {
        return;
    }
    let storage = Game.getObjectById(main_room_memory.storage_list[0]);
    let terminal = Game.getObjectById(main_room_memory.terminal_list[0]);
    if (storage == null || terminal == null) {
        return;
    }
    let dealer_pos = new RoomPosition((storage.pos.x + terminal.pos.x) / 2, (storage.pos.y + terminal.pos.y) / 2, creep.memory.main_room);
    if(!creep.pos.isEqualTo(dealer_pos)) {
        creep.moveTo(dealer_pos);
        return;
    }

};

module.exports = role_dealer;
