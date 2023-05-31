const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();


const blockchain = {
    "chain": [
        {
            "index": 1,
            "timestamp": 1685433217915,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "previousBlockHash": "0"
        },
        {
            "index": 2,
            "timestamp": 1685433270226,
            "transactions": [],
            "nonce": 18140,
            "hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
            "previousBlockHash": "0"
        },
        {
            "index": 3,
            "timestamp": 1685433307410,
            "transactions": [
                {
                    "amount": 12,
                    "sender": "00",
                    "receiver": "57850098470c4f1b8aedc0f361fce85b",
                    "transactionID": "fbeaaad980cc4a6a8b0443f6e4fc688d"
                },
                {
                    "amount": 300,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "785592686b414ff59879a4ee9bcaaaae"
                }
            ],
            "nonce": 90952,
            "hash": "0000955ab01a85bfeb9d569095dddf5e9ddf2567475531c7ba14dd6138442f47",
            "previousBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
        },
        {
            "index": 4,
            "timestamp": 1685433332501,
            "transactions": [
                {
                    "amount": 12,
                    "sender": "00",
                    "receiver": "57850098470c4f1b8aedc0f361fce85b",
                    "transactionID": "fcb22447095f415e939b08d54e7098e3"
                },
                {
                    "amount": 1000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "b04aec47d4a44c88850f705ffb8cd0f4"
                },
                {
                    "amount": 2000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "9669c48fead04c348bcc0419491d5828"
                }
            ],
            "nonce": 82065,
            "hash": "000038645f0271b20972c73bd2333c6a62da0da78ee4dc34f8dd24a510d576cb",
            "previousBlockHash": "0000955ab01a85bfeb9d569095dddf5e9ddf2567475531c7ba14dd6138442f47"
        },
        {
            "index": 5,
            "timestamp": 1685433378180,
            "transactions": [
                {
                    "amount": 12,
                    "sender": "00",
                    "receiver": "57850098470c4f1b8aedc0f361fce85b",
                    "transactionID": "0edfeeb945164037bef753084d53ab23"
                },
                {
                    "amount": 3000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "0a47936ac1f84e93bfa0891644cfabe6"
                },
                {
                    "amount": 4000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "1da3316d3a084b8e8e97637aa4958183"
                }
            ],
            "nonce": 47054,
            "hash": "000043aee7ab2d8f87c21452aea086adcf7cf2b2f8aa1ce5d0effaee51f055ff",
            "previousBlockHash": "000038645f0271b20972c73bd2333c6a62da0da78ee4dc34f8dd24a510d576cb"
        },
        {
            "index": 6,
            "timestamp": 1685433388945,
            "transactions": [
                {
                    "amount": 12,
                    "sender": "00",
                    "receiver": "57850098470c4f1b8aedc0f361fce85b",
                    "transactionID": "23733501cba449fd9d81cb3b43ab71e6"
                },
                {
                    "amount": 5000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "7ef6bcd7030e4191a97fe0f83f35b7c9"
                },
                {
                    "amount": 6000,
                    "sender": "4KN2NN356VS24SL23QKDF",
                    "receiver": "JWFNAGK893U4VCXVEE",
                    "transactionID": "b22759f4ebca48e2b3c0006b8a65bafe"
                }
            ],
            "nonce": 52330,
            "hash": "00008875ff9d286dc80bc1d22f0ef61f4b1fdc4d3e74d6f54959c7ec7694ebcd",
            "previousBlockHash": "000043aee7ab2d8f87c21452aea086adcf7cf2b2f8aa1ce5d0effaee51f055ff"
        }
    ],
    "pendingTransactions": [
        {
            "amount": 12,
            "sender": "00",
            "receiver": "57850098470c4f1b8aedc0f361fce85b",
            "transactionID": "cabfbcffb3914dcda25d2e2a5b737c72"
        }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
}


console.log("VALID: ", bitcoin.chainIsValid(blockchain.chain))
