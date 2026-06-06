
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
    // clear creep store
    if (creep.store.getUsedCapacity() > 0) {
        for (let resource_type in creep.store) {
            if (creep.store[resource_type] > 0) {
                if (creep.memory.status == "to_storage") {
                    creep.transfer(storage, resource_type);
                }
                else if (creep.memory.status == "to_terminal") {
                    creep.transfer(terminal, resource_type);
                }
            }
        }
        return;
    }
    let order = main_room_memory.active_market_order;
    if (order == null || order._amount_to_deal <= 0) {
        // clear terminal store
        if (terminal.store.getUsedCapacity() > 0) {
            for (let resource_type in terminal.store) {
                if (terminal.store[resource_type] > 0) {
                    let withdraw_amount = Math.min(terminal.store[resource_type], creep.store.getFreeCapacity());
                    if (withdraw_amount > 0) {
                        creep.withdraw(terminal, resource_type, withdraw_amount);
                    }
                    if (creep.store.getFreeCapacity() == 0) {
                        break;
                    }
                }
            }
        }
        return;
    }
    if (order.type == ORDER_BUY) {
        let terminal_amount = terminal.store[order.resourceType];
        let _energy_cost = order._energy_cost;

        let amount_to_deal = order._amount_to_deal;
        if (order.resourceType == RESOURCE_ENERGY) {
            amount_to_deal += energy_cost;
        }
        ammount_to_deal = Math.min(amount_to_deal, terminal.store.getCapacity());

        if (terminal_amount < amount_to_deal) {
            let storage_amount = storage.store[order.resourceType];
            if (storage_amount > 0) {
                creep.memory.status = "to_terminal";
                let withdraw_amount = Math.min(order._amount_to_deal, storage_amount, creep.store.getFreeCapacity());
                if (withdraw_amount > 0) {
                    creep.withdraw(storage, order.resourceType, withdraw_amount);
                }
            }
        }
        else if (terminal.store[RESOURCE_ENERGY] < _energy_cost) {
            let storage_amount = storage.store[RESOURCE_ENERGY];
            if (storage_amount > 0) {
                creep.memory.status = "to_terminal";
                let withdraw_amount = Math.min(order._energy_cost, storage_amount, creep.store.getFreeCapacity());
                if (withdraw_amount > 0) {
                    creep.withdraw(storage, RESOURCE_ENERGY, withdraw_amount);
                }
            }
        }
        else if (terminal.cooldown > 0) {
            return;
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
    else if (order.type == ORDER_SELL) {
        let _energy_cost = order._energy_cost;
        if (terminal.store[RESOURCE_ENERGY] < _energy_cost) {
            let storage_amount = storage.store[RESOURCE_ENERGY];
            if (storage_amount > 0) {
                creep.memory.status = "to_terminal";
                let withdraw_amount = Math.min(order._energy_cost, storage_amount, creep.store.getFreeCapacity());
                if (withdraw_amount > 0) {
                    creep.withdraw(storage, RESOURCE_ENERGY, withdraw_amount);
                }
            }
        }
        else if (terminal.store[order.resourceType] > 0) {
            creep.memory.status = "to_storage";
            let withdraw_amount = Math.min(terminal.store[order.resourceType], creep.store.getFreeCapacity());
            if (withdraw_amount > 0) {
                creep.withdraw(terminal, order.resourceType, withdraw_amount);
            }
        }
        else if (terminal.cooldown > 0) {
            return;
        }
        else {
            amount_to_deal = Math.min(order._amount_to_deal, terminal.store.getFreeCapacity());
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
