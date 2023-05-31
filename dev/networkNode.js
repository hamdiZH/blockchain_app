const express = require('express');
const app = express();
const {v4: uuidv4} = require("uuid");
const Blockchain = require("./blockchain");
// request promise allow us to make request to all the other nodes in our network
const rp = require("request-promise");
// process.argv: this means that our variable refers to the command that it run to start the server (in package.json)
// 2: refers to the third element (the port from package.json)
const PORT = process.argv[2];

const nodeAddress = uuidv4().split('-').join('');

const bitcoin = new Blockchain();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// app.use('/api/v1', blockchainRouter);

app.get('/blockchain', (req, res) => {
    res.json({bitcoin});
})

app.post('/transaction', (req, res) => {
    const newTransaction = req.body
    const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction)
    res.json({note: `Transaction will be added in block ${blockIndex}.`})
})

/**
 * @todo: It will create a new transaction and it will broadcast that new transaction to all the other nodes in the network
 * @desc: any time that we want to create a transaction, we are going to hit this point '/transaction/broadcast'
 *
 */
app.post('/transaction/broadcast', (req, res) => {
    const {amount, sender, receiver} = req.body;
    // create a new transaction
    const newTransaction = bitcoin.createNewTransaction(amount, sender, receiver)
    // add the new transaction to the pending transactions array
    bitcoin.addTransactionToPendingTransactions(newTransaction)

    // broadcast the new transaction to all other nodes in the network
    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/transaction',
            method: 'POST',
            body: newTransaction,
            json: true
        }

        // push all requests to the requestPromises array (its array of promises)
        requestPromises.push(rp(requestOptions))
    })

    // run all the requests inside the requestPromises array
    Promise.all(requestPromises)
        .then((data) => {
            res.json({note: 'Transaction created and broadcasting successfully'})
        })
})

app.get('/mine', (req, res) => {
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index'] + 1,
    };
    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(
        previousBlockHash,
        currentBlockData,
        nonce
    );
    const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises = []
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: networkNodeUrl + '/receive-new-block',
            method: 'POST',
            body: {newBlock: newBlock},
            json: true
        }
        requestPromises.push(rp(requestOption))
    })

    Promise.all(requestPromises)
        .then(data => {
            // create a new mining reward transaction and broadcast it to the whole network
            const requestOptions = {
                uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
                method: 'POST',
                body: {
                    amount: 12,
                    sender: '00',
                    receiver: nodeAddress
                },
                json: true
            }
            return rp(requestOptions)
        })
        .then(data => {
            res.json({
                note: 'New block mined and broadcast successfully',
                block: newBlock,
            });
        })
})

/**
 * @todo: assign the mined new block to the node
 */
app.post('/receive-new-block', (req, res) => {
    // receive the new block that has been broadcast
    const {newBlock} = req.body
    /** check multiple things to check if this block is legitimate, and it's actually a real block, and it fits into the chain */
        // 1- check if the previous block hash in the new block is equal to the hash in the last block in our chain
    const lastBlock = bitcoin.getLastBlock()
    const legitimateHash = lastBlock.hash === newBlock.previousBlockHash; // If true, it means that the new block is legitimate
    // check if the new block has the correct index, should be +1 of the last block index number
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if (legitimateHash && correctIndex) {
        bitcoin.chain.push(newBlock);
        // clear the pending transactions after adding the new block successful, because the pending transactions are now inside this block when it is mined
        bitcoin.pendingTransactions = [];
        res.json({
            note: 'New block received and accepted',
            newBlock: newBlock
        })
    } else {
        res.json({
            note: 'New block rejected',
            newBlock: newBlock
        })
    }


})

/**
 * @todo: It will register the new node with itself and then it will broadcast the new node to all other nodes that are already present in our network
 * @param req
 * @param res
 */
app.post('/register-broadcast-node', (req, res) => {
    const newNodeUrl = req.body.newNodeUrl;
    // if new node url is not already existing in our network nodes array, then added to the array
    if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) bitcoin.networkNodes.push(newNodeUrl);

    // define array of promises, because rp return in a single array
    const registerNodesPromises = [];
    // Broadcast the new node url to all other nodes of the network
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        // hit 'register-node' endpoint
        const requestOptions = {
            uri: networkNodeUrl + '/register-node',
            method: 'POST',
            body: {newNodeUrl: newNodeUrl},
            json: true
        };

        registerNodesPromises.push(rp(requestOptions));
    });
    // run all these promises
    Promise.all(registerNodesPromises)
        .then(data => {
            // After the whole broadcast is completed, we have to register all the nodes that are currently inside our network with the new node that we are adding to the network,
            // so we need to hit 'register-nodes-bulk'
            const bulkRegisterOptions = {
                uri: newNodeUrl + '/register-nodes-bulk',
                method: 'POST',
                body: {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
                json: true
            };
            return rp(bulkRegisterOptions)
        })
        .then(data => {
            // The final: send a response back to whoever called it
            res.json({note: 'New node registered with network successfully'});
        });
})

/**
 * @todo: It will register the new node with the node that received this request
 * @param req
 * @param res
 */
app.post('/register-node', (req, res) => {
    const {newNodeUrl} = req.body;
    // Check if the new node is already registered
    // check if the new node url is actually the url of the current node that we are on
    const nodeNotAlreadyRegistered = bitcoin.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl
    if (nodeNotAlreadyRegistered && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({note: 'New node registered successfully.'});
})

/**
 * @todo: It accepting data that contains the roles of every node already exists in the network
 * @desc We used this endpoint in the register-and-broadcast node endpoint, It takes all the nodes that are already inside the network and send their data to the new node, so that the new node can register and recognize all the nodes that are already registered exists inside the network
 * @param req
 * @param res
 */
app.post('/register-nodes-bulk', (req, res) => {
    const {allNetworkNodes} = req.body
    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeNotAlreadyExist = bitcoin.networkNodes.indexOf(networkNodeUrl) === -1;
        const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl
        if (nodeNotAlreadyExist && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl)
    })

    res.json({note: 'Bulk registration successful'})
})

/**
 * @todo: check if the chain is valid, It should conform that that the specific node has the correct blockchain data in it and that node is synced with the rest of nodes inside the network
 * @desc: make a request to every other node inside the blockchain network to get copies of the blockchain and compare them with the copy of the blockchain that's hosted on this current node
 */
app.get('/consensus', (req, res) => {
    const requestPromises = [];
    bitcoin.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: networkNodeUrl + '/blockchain',
            method: 'GET',
            json: true
        };
        requestPromises.push(rp(requestOptions));
    })
    Promise.all(requestPromises)
        .then(data => {
            console.log("data", data)
            // data: array of blockchains which hosted across all the other nodes in our network
            // We want to iterate through all of these blockchains that came from the other nodes inside our network, also we want to see if there is a blockchain inside the blockchains which returns(data)
            // length of the blockchain that is hosted on the current node
            const currentChainLength = bitcoin.chain.length; // Max chain length (default value is the length of the current chain length
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = null;
            data.forEach(blockchain => {
                console.log("blockchain", blockchain.bitcoin.chain)
                console.log("blockchain length", blockchain.bitcoin.chain?.length)
                // check if one of the blockchains from the other nodes is longer than the blockchain hosted on our current node
                if (blockchain.bitcoin.chain.length > maxChainLength) {
                    maxChainLength = blockchain.bitcoin.length;
                    newLongestChain = blockchain.bitcoin.chain;
                    newPendingTransactions = blockchain.bitcoin.pendingTransactions;
                }
            })

            // check if there is no longest chain or there is the longest chain, but it is not valid
            if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
                res.json({
                    note: 'Current chain has not been replaced.',
                    chain: bitcoin.chain
                });
            } else {
                // replace the current chain with the founded longest chain, and updating pending transactions
                bitcoin.chain = newLongestChain;
                bitcoin.pendingTransactions = newPendingTransactions;
                res.json({
                    note: 'This chain has been replaced.',
                    chain: bitcoin.chain
                });
            }
        })
})

app.listen(PORT, () => console.log(`Server run on port ${PORT}`));
