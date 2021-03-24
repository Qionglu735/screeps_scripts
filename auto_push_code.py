
# -*- coding: utf-8 -*-

import difflib
import json
import os
import requests


SERVER_HOST = "SERVER_HOST"
SERVER_PORT = "SERVER_PORT"
USERNAME = "USERNAME"
PASSWORD = "PASSWORD"


def main():
    branch_name = "screeps-mk3"
    local_modules = read_file(branch_name)
    # print(local_modules["screeps-mk2"])
    token = requests.post("http://{}:{}/api/auth/signin".format(SERVER_HOST, SERVER_PORT),
                          json={
                              "email": USERNAME,
                              "password": PASSWORD
                          }).json()["token"]
    server_modules = requests.get("http://{}:{}/api/user/code".format(SERVER_HOST, SERVER_PORT),
                                  headers={
                                      "X-Token": token,
                                      "X-Username": token
                                  }).json()["modules"]
    diff_module("modules", server_modules, local_modules)
    print("Push to \"{}\"?[yes/no]".format(branch_name))
    confirm = raw_input()
    if confirm.lower() == "yes":
        print "Pushing..."
        print requests.post("http://{}:{}/api/user/code".format(SERVER_HOST, SERVER_PORT),
                            headers={
                                "X-Token": token,
                                "X-Username": token
                            }, json={
                                "branch": branch_name,
                                "modules": local_modules,
                            }).json()


def read_file(path):
    modules = dict()
    root, dirs, files = next(os.walk(path))
    # print(root, dirs, files)
    for _file in files:
        if not _file.endswith(".js"):
            continue
        filename = _file.rstrip(".js")
        with open(os.path.join(root, _file)) as f:
            data = f.read()
            modules[filename] = data.decode("utf-8")
    for _dir in dirs:
        modules[_dir] = read_file(os.path.join(root, _dir))
    return modules


def diff_module(key, server_module, local_module):
    if server_module == local_module:
        pass
    elif type(server_module) == unicode and type(local_module) == unicode:
        if local_module == server_module.replace("\r", ""):
            pass
        else:
            print("=== module: {}".format(key + ".js"))
            differ = difflib.Differ()
            diff_res = list(differ.compare(server_module.splitlines(), local_module.replace("\r", "").splitlines()))
            for _index, i in enumerate(diff_res):
                if i[0] != " ":
                    print("{:>3} {}".format(_index+1, i.replace("\n", "")))
            print("\n")
    elif type(server_module) == unicode:
        print("--- module(file): {}".format(key))
        print("+++ module(dir): {}".format(key))
    elif type(local_module) == unicode:
        print("--- module(dir): {}".format(key))
        print("+++ module(file): {}".format(key))
    else:
        server_key_list = server_module.keys()
        local_key_list = local_module.keys()
        for i in set(server_key_list).difference(set(local_key_list)):
            print("--- module: {}".format(i))
        for i in set(local_key_list).difference(set(server_key_list)):
            print("+++ module: {}".format(i))
        for i in set(server_key_list).intersection(set(local_key_list)):
            diff_module(i, server_module[i], local_module[i])


if __name__ == "__main__":
    main()
