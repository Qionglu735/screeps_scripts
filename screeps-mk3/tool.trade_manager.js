
let trade_manager = {
    update_order_info: function() {
        if (Memory.market_order_list == null) {
            Memory.market_order_list = [];
        }
        if (Memory.market_order_dict == null) {
            Memory.market_order_dict = {};
        }
        for (let order_id of Memory.market_order_list) {
            let order_info = Game.market.getOrderById(order_id);
            if (order_info == null) {
                delete Memory.market_order_dict[order_id];
                Memory.market_order_list = Memory.market_order_list.filter(id => id !== order_id);
                continue;
            }
            if (Memory.market_order_dict[order_id] == null) {
                Memory.market_order_dict[order_id] = order_info;
            }
            else {
                Memory.market_order_dict[order_id] = {
                    ...Memory.market_order_dict[order_id],
                    ...order_info,
                };
            }
        }
    },
    search_buy_order: function(main_room_name) {
        let main_room_memory = Memory.room_dict[main_room_name];
        if (main_room_memory.storage_list.length == 0
            || main_room_memory.terminal_list.length == 0
            || main_room_memory.creep.dealer.name_list.length == 0
        ) {
            return;
        }
        let storage = Game.getObjectById(main_room_memory.storage_list[0]);
        let terminal = Game.getObjectById(main_room_memory.terminal_list[0]);
        let dealer = Game.creeps[main_room_memory.creep.dealer.name_list[0]];
        for (let resource_type of [RESOURCE_ENERGY, RESOURCE_HYDROGEN]) {
            let amount_available = 
                storage.store[resource_type] + terminal.store[resource_type] + dealer.store[resource_type]
                - (storage.store.getCapacity() * STORAGE_THRESHOLD[resource_type] * SELL_ABOVE_THRESHOLD);
            let energy_available = 
                storage.store[RESOURCE_ENERGY] + terminal.store[RESOURCE_ENERGY] + dealer.store[RESOURCE_ENERGY]
                - (storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY] * (SELL_ABOVE_THRESHOLD / 2));
            if (amount_available <= 0 || energy_available <= 0) {
                continue;
            }
            let order_dict = {};
            for (let order of Game.market.getAllOrders(
                (order) => 
                    order.type == ORDER_BUY 
                    && order.resourceType == resource_type 
                    && order.price >= SELL_MIN_PRICE[resource_type]
            )) {
                order_dict[order.id] = order;
            }
            let max_price = -Infinity, max_price_order_id = null;
            for (let order_id in order_dict) {
                let order = order_dict[order_id];
                let amount_to_deal = Math.min(order.remainingAmount, amount_available);
                let energy_cost = Game.market.calcTransactionCost(amount_to_deal, main_room_name, order.roomName);
                if (energy_cost > energy_available) {
                    continue;
                }
                if (resource_type == RESOURCE_ENERGY && amount_to_deal + energy_cost > energy_available) {
                    continue;
                }
                if (order.price * amount_to_deal > max_price) {
                    max_price = order.price * amount_to_deal;
                    max_price_order_id = order_id;
                    order_dict[order.id]._amount_to_deal = amount_to_deal;
                    order_dict[order.id]._energy_cost = energy_cost;
                }
            }
            if (max_price_order_id != null) {
                let order = order_dict[max_price_order_id];
                Memory.active_market_order = order;
                console.log("[Market]", order.type, order.resourceType, order._amount_to_deal, order.price * order._amount_to_deal, order._energy_cost);
            }
        }
    },
};

module.exports = trade_manager;
