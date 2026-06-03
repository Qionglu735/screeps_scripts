
let trade_manager = {
    update_order_info: function(main_room_name) {
        let main_room_memory = Memory.room_dict[main_room_name];
        if (main_room_memory.active_market_order == null) {
            return;
        }
        if (main_room_memory.active_market_order._amount_to_deal <= 0) {
            main_room_memory.active_market_order = null;
            return;
        }
        let order_info = Game.market.getOrderById(main_room_memory.active_market_order.id);
        if (order_info == null) {
            delete Memory.market_order_dict[main_room_memory.active_market_order.id];
            Memory.market_order_list = Memory.market_order_list.filter(
                id => id !== main_room_memory.active_market_order.id
            );
            main_room_memory.active_market_order = null;
            return;
        }
        else {
            for (let key in order_info) {
                main_room_memory.active_market_order[key] = order_info[key];
            }
        }
        console.log(
            `[Market]`, 
            main_room_memory.active_market_order.type, main_room_memory.active_market_order.resourceType,
            "Amount:", main_room_memory.active_market_order._amount_to_deal,
            (main_room_memory.active_market_order.type == ORDER_BUY ? "Earn:" : "Cost:"), main_room_memory.active_market_order.price * main_room_memory.active_market_order._amount_to_deal,
            "Energy:", main_room_memory.active_market_order._energy_cost
        );
    },
    search_buy_order: function(main_room_name) {
        let main_room_memory = Memory.room_dict[main_room_name];
        if (main_room_memory.active_market_order != null) {
            return;
        }
        if (main_room_memory.storage_list.length == 0
            || main_room_memory.terminal_list.length == 0
        ) {
            return;
        }
        let storage = Game.getObjectById(main_room_memory.storage_list[0]);
        let terminal = Game.getObjectById(main_room_memory.terminal_list[0]);
        let dealer = null;
        if (main_room_memory.creep.dealer.name_list.length > 0) {
            dealer = Game.creeps[main_room_memory.creep.dealer.name_list[0]];
        }
        
        let energy_available = 
            storage.store[RESOURCE_ENERGY] + terminal.store[RESOURCE_ENERGY] + (dealer != null ? dealer.store[RESOURCE_ENERGY] : 0)
            - (storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY] * (SELL_ABOVE_THRESHOLD / 2));
        if (energy_available <= 0) {
            return;
        }
        for (let resource_type of [RESOURCE_ENERGY, RESOURCE_HYDROGEN]) {
            let amount_available = 
                storage.store[resource_type] + terminal.store[resource_type] + (dealer != null ? dealer.store[resource_type] : 0)
                - (storage.store.getCapacity() * STORAGE_THRESHOLD[resource_type] * SELL_ABOVE_THRESHOLD);
            if (amount_available <= 0) {
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
                main_room_memory.active_market_order = order;
            }
        }
    },
    search_sell_order: function(main_room_name) {
        let main_room_memory = Memory.room_dict[main_room_name];
        if (main_room_memory.active_market_order != null) {
            return;
        }
        if (Memory.credits_baseline == null) {
            Memory.credits_baseline = Game.market.credits * 0.9;
        }
        if (Game.market.credits * 0.9 > Memory.credits_baseline) {
            Memory.credits_baseline = Game.market.credits * 0.9;
        }
        let credit_available = Game.market.credits - Memory.credits_baseline;
        if (credit_available <= 0) {
            return;
        }

        if (main_room_memory.storage_list.length == 0
            || main_room_memory.terminal_list.length == 0
            || main_room_memory.creep.dealer.name_list.length == 0
        ) {
            return;
        }
        let storage = Game.getObjectById(main_room_memory.storage_list[0]);
        let terminal = Game.getObjectById(main_room_memory.terminal_list[0]);
        let dealer = null;
        if (main_room_memory.creep.dealer.name_list.length > 0) {
            dealer = Game.creeps[main_room_memory.creep.dealer.name_list[0]];
        }

        let energy_available = 
            storage.store[RESOURCE_ENERGY] + terminal.store[RESOURCE_ENERGY] + (dealer != null ? dealer.store[RESOURCE_ENERGY] : 0)
            - storage.store.getCapacity() * STORAGE_THRESHOLD[RESOURCE_ENERGY] * (SELL_ABOVE_THRESHOLD / 2);
        if (energy_available <= 0) {
            return;
        }

        for (let resource_type of [RESOURCE_OXYGEN]) {
            let amount_require = 
                storage.store.getCapacity() * STORAGE_THRESHOLD[resource_type] * BUY_BELOW_THRESHOLD
                - storage.store[resource_type] - terminal.store[resource_type] - (dealer != null ? dealer.store[resource_type] : 0);
            if (amount_require <= 0) {
                continue;
            }
            let order_dict = {};
            for (let order of Game.market.getAllOrders(
                (order) => 
                    order.type == ORDER_SELL 
                    && order.resourceType == resource_type 
                    && order.price <= BUY_MAX_PRICE[resource_type]
            )) {
                order_dict[order.id] = order;
            }
            let min_price = Infinity, min_price_order_id = null;
            for (let order_id in order_dict) {
                let order = order_dict[order_id];
                let amount_to_deal = Math.min(order.remainingAmount, amount_require, Math.floor(credit_available / order.price));
                if (amount_to_deal <= 0) {
                    continue;
                }
                let energy_cost = Game.market.calcTransactionCost(amount_to_deal, main_room_name, order.roomName);
                if (energy_cost > energy_available) {
                    continue;
                }
                if (resource_type == RESOURCE_ENERGY && amount_to_deal + energy_cost > energy_available) {
                    continue;
                }
                if (order.price * amount_to_deal < min_price) {
                    min_price = order.price * amount_to_deal;
                    min_price_order_id = order_id;
                    order_dict[order.id]._amount_to_deal = amount_to_deal;
                    order_dict[order.id]._energy_cost = energy_cost;
                }
            }
            if (min_price_order_id != null) {
                let order = order_dict[min_price_order_id];
                main_room_memory.active_market_order = order;
            }
        }
    },
};

module.exports = trade_manager;
