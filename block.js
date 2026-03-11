const crypto = require('crypto');
const buildMerkleTree = require('./merkleTree');

function calculateHash(index, timestamp, merkleRoot, previousHash) {

    return crypto
        .createHash('sha256')
        .update(index + timestamp + merkleRoot + previousHash)
        .digest('hex');
}

function createBlock(index, transactions, previousHash) {

    const timestamp = new Date().toISOString();

    const merkleRoot = buildMerkleTree(transactions);

    const hash = calculateHash(index, timestamp, merkleRoot, previousHash);

    return {
        index,
        timestamp,
        transactions,
        previousHash,
        hash
    };
}

module.exports = createBlock;