
FIRST_SPAWN_NAME = "Spawn1";

////    Memory Template
////    deep copy is necessary

ROOM_TEMPLATE = {
    "source": {},
    "mineral": {},
    "claim_status": "neutral",
    "hostile_status": "neutral",
    "assigned_claimer": null,
    "main_room": null,
    "room_distance": {},
};

MAIN_ROOM_TEMPLATE = {
    "spawn_list": [],
    "container_list": [],
    "extension_list": [],
    "extension_table": {
        "1": [-1, 1], "2": [1, 1],
        "40": [-3, 1], "41": [-2, 1], "42": [2, 1], "43": [3, 1],
        "3": [-2, 2], "4": [0, 2], "5": [2, 2],
        "44": [-4, 2], "45": [-3, 2], "46": [3, 2], "47": [4, 2],
        "6": [-3, 3], "7": [-1, 3], "8": [1, 3], "9": [3, 3],
        "48": [-4, 3], "49": [0, 3], "50": [4, 3],
        "10": [-4, 4], "11": [-2, 4], "12": [0, 4], "13": [2, 4], "14": [4, 4],
        "15": [-3, 5], "16": [-1, 5], "17": [1, 5], "18": [3, 5],
        "51": [-2, 5], "52": [0, 5], "53": [2, 5],
        "19": [-4, 6], "20": [-2, 6], "21": [0, 6], "22": [2, 6], "23": [4, 6],
        "24": [-3, 7], "25": [-1, 7], "26": [1, 7], "27": [3, 7],
        "54": [-4, 7], "55": [0, 7], "56": [4, 7],
        "28": [-4, 8], "29": [-2, 8], "30": [0, 8], "31": [2, 8], "32": [4, 8],
        "57": [-3, 8], "58": [3, 8],
        "33": [-3, 9], "34": [-1, 9], "35": [1, 9], "36": [3, 9],
        "59": [-2, 9], "60": [2, 9],
        "37": [-2, 10], "38": [0, 10], "39": [2, 10],
    },
    "storage_list": [],
    "storage_table": {
        "1": [0, -2],
    },
    "tower_list": [],
    "tower_table": {
        "1": [-2, 0],
        "2": [2, 0],
    },
    "energy_stat": {
        "energy_track": [],
        "10_tick_sum_a": 0, "10_tick_sum_b": 0, "10_tick_sum_trend": 0,  // 10 second
        "60_tick_sum_a": 0, "60_tick_sum_b": 0, "60_tick_sum_trend": 0,  // 1 minute
        "600_tick_sum_a": 0, "600_tick_sum_b": 0, "600_tick_sum_trend": 0,  // 10 minute
        "3600_tick_sum_a": 0, "3600_tick_sum_b": 0, "3600_tick_sum_trend": 0,  // 1 hour
        "36000_tick_sum_a": 0, "36000_tick_sum_b": 0, "36000_tick_sum_trend": 0,  // 10 hour
    },
    "creep_spawn_list": [],
    "spawn_cool_down": 0,
    "spawn_idle_time": 0,
    "creep": {
        "harvester": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "miner": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 4,
        },
        "upgrader": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "carrier": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "scout": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "claimer": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "refueler": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
        "builder": {
            "name_list": [],
            "max_num": 0,
            "avg_level": 0,
            "max_level": 1,
        },
    },
    "sub_room_list": [],
};

CPU_STAT_TEMPLATE = {
    "cpu_track": [],
    "60_tick_sum": 0, "60_tick_avg": 0,  // 1 minute
    "600_tick_sum": 0, "600_tick_avg": 0,  // 10 minute
    "3600_tick_sum": 0, "3600_tick_avg": 0,  // 1 hour
};
