"""Project Reality mod server query script

author: @gbidkar
args: client.py ServerIP ServerQueryPort RequestTimeout
desc:
    Fetches query information from given IP:PORT of a server with a given timeout
    and returns it as a response in a JSON format to stdout, using native Python.
"""
import socket
import time
import binascii
import sys
import json

HOSTNAME_INDEX = 1
MAP_INDEX = 7
CURR_PLAYERS_INDEX = 13
MAX_PLAYERS_INDEX = 15
GAMESTATUS_INDEX = 17

ERROR_CODE_LISTENEXCEPTION = 1
ERROR_CODE_INVALIDSERVERINFO = 2

r = b''

def listen():
    global r
    data, a = s.recvfrom(1400)
    r = r + data

def is_server_info_okay(serv_info, startindx):
    return serv_info[startindx + HOSTNAME_INDEX - 1] == 'hostname' and \
           serv_info[startindx + MAP_INDEX - 1] == 'mapname' and \
           serv_info[startindx + CURR_PLAYERS_INDEX - 1] == 'numplayers'
       

def report_success(hostname, curr_map, num_players, max_players, gamestatus):
    print(json.dumps({"hostname": hostname, "map": curr_map, "num_players": num_players, "max_players": max_players, "gamestatus": gamestatus}))

def report_fail(errnum, errmsg):
    print(json.dumps({"errnum": errnum, "errmsg": errmsg}))

addr = (sys.argv[1], int(sys.argv[2]))
timeout = float(sys.argv[3])

data = binascii.unhexlify("fefd00f1822a34ffffff01")
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.settimeout(timeout)
s.sendto(data, addr)

try:
    listen()
except BaseException as e:
    report_fail(ERROR_CODE_LISTENEXCEPTION, e.message)

serv_info = r.decode("cp437").split("\x00")
s.close()

start_index = serv_info.index("hostname")

# TODO: Hasn't really been tested.
# if not is_server_info_okay(serv_info, start_index):
#    report_fail(ERROR_CODE_INVALIDSERVERINFO, "Returned server information is incorrect! Indexes have weird offsets!")

hostname = serv_info[start_index + HOSTNAME_INDEX]
current_map = serv_info[start_index + MAP_INDEX]
players = serv_info[start_index + CURR_PLAYERS_INDEX]
max_players = serv_info[start_index + MAX_PLAYERS_INDEX]
gamestatus = serv_info[start_index + GAMESTATUS_INDEX]

report_success(hostname, current_map, players, max_players, gamestatus)
sys.stdout.flush()