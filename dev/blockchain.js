const sha256 = require('sha256');
const currentNodeUrl = process.argv[3]
const {v4: uuidv4} = require("uuid");

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    // Generate a geneses block in our blockchain
    this.createNewBlock(100, '0', '0');
}

/**
 * @todo Create new Block
 * @param {1} nonce it is comes from a proof of work, in our case it is a number (any number). it is proof that we created this new block in a legitimate way by using proof of work method
 * @param {2} previousBlockHash The hash from our previous block
 * @param {3} hash The hash will be the hash of our new block (current block)
 * @returns
 */
Blockchain.prototype.createNewBlock = function (
    nonce,
    previousBlockHash,
    hash
) {
    const newBlock = {
        // describe what the number of the block in our chain
        index: this.chain.length + 1,
        // when this block is created
        timestamp: Date.now(),
        // when creating new block, we are going to put all of the new transactions or all of the pending transactions that have just been created into this new block
        // so that they're inside of our blockchain so that they can never be changed.
        transactions: this.pendingTransactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previousBlockHash,
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};

// Get last block in the chain
Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
};

/**
 *
 * @param {1} amount a mount of the transaction, (how much is being sent in this transaction)
 * @param {2} sender sender address
 * @param {3} receiver receiver address
 * @returns the new transaction
 */
Blockchain.prototype.createNewTransaction = function (
    amount,
    sender,
    receiver,
) {
    return {
        amount: amount,
        sender: sender,
        receiver: receiver,
        transactionID: uuidv4().split('-').join('')
    };
};

/**
 *@todo: take the new created transaction and push it to the pending transaction array
 * @param transactionObj The new transaction which created
 */
Blockchain.prototype.addTransactionToPendingTransactions = function (transactionObj) {
    this.pendingTransactions.push(transactionObj)
    return this.getLastBlock()['index'] + 1
}

/**
 * @todo hashBlock function will take in a block from our blockchain and hash that block into some fixed length string (Generate hash)
 * @param {1} previousBlockHash previous Block hash
 * @param {2} currentBlockData current block of our blockchain
 * @param {3} nonce
 * @returns some fixed length string (hash)
 */
Blockchain.prototype.hashBlock = function (
    previousBlockHash,
    currentBlockData,
    nonce
) {
    const dataAsString =
        previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);
    return hash;
};

/**
 * @todo Proof of work method/ from the data which we supplied(previousBlockHash, currentBlockData) it is going to try to generate a specific hash
 * in our case, the hash will starts with four zeros
 * @param {1} previousBlockHash previous block hash
 * @param {2} currentBlockData current block data
 * @returns nonce value that gives us a valid hash in which the first four characters are 0000
 */
Blockchain.prototype.proofOfWork = function (
    previousBlockHash,
    currentBlockData
) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
};

/**
 * @todo: It validate the other chains inside of our network, we are comparing them to the chain that is hosted on our current node (validate that this blockchain is legitimate
 * @desc: We will iterate through every block inside of the blockchain and make sure that all of the hashes align up correctly
 * @param blockchain
 * @returns whether the blockchain is valid or not
 */
Blockchain.prototype.chainIsValid = function (blockchain) {
    // flag
    let isChainValid = true;
    // We start from index 1 and skipping index 0 which is geneses block because it is kind of special case because we made it by ourselves without doing proof of work
    for (let i = 1; i < blockchain.length; i++) {
        // **inside the for loop, we want to compare the current block to the previous block
        // get current block
        const currentBlock = blockchain[i];
        const prevBlock = blockchain[i - 1];
        // hash of current block
        // Now we want to validate that every single block inside our chain has the correct data
        // We can do this by using our hash method, if the generated hash starts with 4-zeros, then we know that all the data is valid
        const blockHash = this.hashBlock(prevBlock['hash'], {
            transactions: currentBlock['transactions'],
            index: currentBlock['index']
        }, currentBlock['nonce']);
        if (blockHash.substring(0, 4) !== '0000') isChainValid = false;
        // compare the previous block hash on the **current block** with the hash property at the **previous block**
        if (currentBlock['previousBlockHash'] !== prevBlock['hash']) isChainValid = false;

    }
    // check the genesis block properties is correct
    const genesisBock = blockchain[0]
    const correctGenesisNonce = genesisBock.nonce === 100
    const correctGenesisPreviousHash = genesisBock.previousBlockHash === '0'
    const correctGenesisHash = genesisBock.hash === '0'
    const correctGenesisTransactions = genesisBock.transactions.length === 0

    if (!correctGenesisNonce || !correctGenesisPreviousHash || !correctGenesisHash || !correctGenesisTransactions) {
        isChainValid = false
    }
    return isChainValid
}

module.exports = Blockchain;
