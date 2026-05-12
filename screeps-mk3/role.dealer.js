
let role_dealer = function(creep) {
    if(creep.memory.status == null || !["to_storage", "to_terminal"].includes(creep.memory.status)) {
        creep.memory.status = null;
    }
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
    let tranfered_flag = false;
    for (let resource_type in creep.store) {
        if (creep.store[resource_type] > 0) {
            if (creep.memory.status == "to_storage") {
                creep.transfer(storage, resource_type);
                tranfered_flag = true;
            }
            else if (creep.memory.status == "to_terminal") {
                creep.transfer(terminal, resource_type);
                tranfered_flag = true;
            }
        }
    }
    if (tranfered_flag) {
        return;
    }
    let order = Memory.active_market_order;
    if (order._amount_to_deal <= 0) {
        return;
    }
    if (order.type == ORDER_BUY) {
        let terminal_amount = terminal.store[order.resourceType] || 0;
        let _energy_cost = order._energy_cost || 0;

        let amount_to_deal = order._amount_to_deal;
        if (order.resourceType == RESOURCE_ENERGY) {
            amount_to_deal += energy_cost;
        }
        ammount_to_deal = Math.min(amount_to_deal, terminal.store.getCapacity());

        if (terminal_amount < amount_to_deal) {
            let storage_amount = storage.store[order.resourceType] || 0;
            if (storage_amount > 0) {
                creep.memory.status = "to_terminal";
                let transfer_amount = Math.min(order._amount_to_deal, storage_amount, creep.store.getFreeCapacity());
                if (transfer_amount > 0) {
                    creep.withdraw(storage, order.resourceType, transfer_amount);
                }
            }
        }
        else if (terminal.store[RESOURCE_ENERGY] < _energy_cost) {
            let storage_amount = storage.store[RESOURCE_ENERGY] || 0;
            if (storage_amount > 0) {
                creep.memory.status = "to_terminal";
                let transfer_amount = Math.min(order._energy_cost, storage_amount, creep.store.getFreeCapacity());
                if (transfer_amount > 0) {
                    creep.withdraw(storage, RESOURCE_ENERGY, transfer_amount);
                }
            }
        }
        else {
            amount_to_deal = Math.min(order._amount_to_deal, terminal_amount);
            let deal_res = Game.market.deal(order.id, amount_to_deal, creep.memory.main_room);
            switch (deal_res) {
                case OK:
                    order._amount_to_deal -= amount_to_deal;
                    break;
                default:
                    console.log("[!] Market deal failed: " + deal_res);
                    break;
            }
        }
    }
};

module.exports = role_dealer;
