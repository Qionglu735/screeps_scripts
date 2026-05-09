
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
    if (Memory.market_order_list == null) {
        Memory.market_order_list = [];
    }
    if (Memory.market_order_dict == null) {
        Memory.market_order_dict = {};
    }
    for (let resource_type in creep.store) {
        if (creep.store[resource_type] > 0) {
            creep.transfer(terminal, resource_type);
        }
    }
    for (let order_id of Memory.market_order_list) {
        if (Memory.market_order_dict[order_id] == null) {
            Memory.market_order_dict[order_id] = Game.market.getOrderById(order_id);
        }
        else {
            Memory.market_order_dict[order_id] = {
                ...Memory.market_order_dict[order_id],
                ...Game.market.getOrderById(order_id),
            };
        }
        let order = Memory.market_order_dict[order_id];
        if (order == null || order.active == false || order.remainingAmount == 0) {
            continue;
        }
        if (order.amount_to_deal == null) {
            order.amount_to_deal = 0;
        }
        if (order.amount_to_deal <= 0) {
            continue;
        }
        if (order.type == ORDER_BUY) {
            let terminal_amount = terminal.store[order.resourceType] || 0;
            let energy_cost = Game.market.calcTransactionCost(order.amount_to_deal, creep.memory.main_room, order.roomName);

            let amount_to_deal = order.amount_to_deal;
            if (order.resourceType == RESOURCE_ENERGY) {
                amount_to_deal += energy_cost;
            }
            ammount_to_deal = Math.min(amount_to_deal, terminal.store.getCapacity());

            if (terminal_amount < amount_to_deal) {
                let storage_amount = storage.store[order.resourceType] || 0;
                if (storage_amount > 0) {
                    let transfer_amount = Math.min(order.amount_to_deal, storage_amount, creep.store.getFreeCapacity());
                    if (transfer_amount > 0) {
                        creep.withdraw(storage, order.resourceType, transfer_amount);
                    }
                }
            }
            else {
                amount_to_deal = Math.min(order.amount_to_deal, terminal_amount);
                let deal_res = Game.market.deal(order.id, amount_to_deal, creep.memory.main_room);
                switch (deal_res) {
                    case OK:
                        order.amount_to_deal -= amount_to_deal;
                        break;
                    default:
                        console.log("[!] Market deal failed: " + deal_res);
                        break;
                }
            }
        }
    }
};

module.exports = role_dealer;
