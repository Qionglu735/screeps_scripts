
let structure_link = function(link) {
    for(let room_name of Memory.main_room_list) {
        let main_room_memory = Memory.room_dict[room_name];
        if(link.id === main_room_memory.link_spawn) {
            if (link.store[RESOURCE_ENERGY] >= 50 && link.cooldown === 0) {
                let link_controller = Game.getObjectById(main_room_memory.link_controller);
                if (link_controller != null
                    && link_controller.store[RESOURCE_ENERGY] <= link_controller.store.getCapacity(RESOURCE_ENERGY) - 50
                ) {
                    let transfer_status = link.transferEnergy(link_controller);
                    switch(transfer_status) {
                        case OK:
                            break;
                        default:
                            console.log("[!]", "link transfer", transfer_status);
                            break;
                    }
                }
            }
        }
    }
}

module.exports = structure_link;
