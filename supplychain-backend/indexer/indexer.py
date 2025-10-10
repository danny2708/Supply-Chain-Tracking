import os, time, json
from web3 import Web3
from dotenv import load_dotenv
load_dotenv()

GANACHE = os.getenv('GANACHE_URL','http://127.0.0.1:7545')
w3 = Web3(Web3.HTTPProvider(GANACHE))
print('Connected:', w3.is_connected())

ABI_PATH = os.path.join(os.path.dirname(__file__), 'abi.json')
CONTRACT_ADDR = os.getenv('SUPPLYCHAIN_ADDRESS','')

if os.path.exists(ABI_PATH):
    abi = json.load(open(ABI_PATH))
else:
    abi = []

if not CONTRACT_ADDR:
    print('Set SUPPLYCHAIN_ADDRESS in env to listen for events.')

def poll():
    # demo: print latest block number periodically
    last = w3.eth.block_number
    while True:
        if w3.eth.block_number > last:
            print('New block', w3.eth.block_number)
            last = w3.eth.block_number
        time.sleep(2)

if __name__=='__main__':
    poll()
