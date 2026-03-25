const crypto = require('crypto');
const { buildMerkleTree, getMerkleRoot } = require('./merkleTree');

// ==============================
// HASH FUNCTION (BLOCK HEADER)
// ==============================
function calculateHash(index, timestamp, previousHash, merkleRoot, nonce) {
    return crypto
        .createHash('sha256')
        .update(index + timestamp + previousHash + merkleRoot + nonce)
        .digest('hex');
}


// ==============================
// MINE BLOCK (PROOF OF WORK)
// ==============================
function mineBlock(index, transactions, previousHash, difficulty = 2) {

    const timestamp = new Date().toISOString();

    // =========================
    // BUILD MERKLE ROOT
    // =========================
    const txHashes = transactions.length > 0
        ? transactions.map(tx => tx.txHash)
        : ["EMPTY"]; // safety fallback

    const tree = buildMerkleTree(txHashes);
    const merkleRoot = getMerkleRoot(tree);

    let nonce = 0;
    let hash = "";

    const target = "0".repeat(difficulty);

    console.log(`⛏️ Mining block ${index}...`);

    // =========================
    // PROOF OF WORK LOOP
    // =========================
    do {
        nonce++;
        hash = calculateHash(
            index,
            timestamp,
            previousHash,
            merkleRoot,
            nonce
        );
    } while (!hash.startsWith(target));

    console.log(`✅ Block ${index} mined`);
    console.log(`Nonce: ${nonce}`);
    console.log(`Hash: ${hash}\n`);

    // =========================
    // RETURN BLOCK OBJECT
    // =========================
    return {
        index,
        timestamp,
        previousHash,
        merkleRoot,                 // REQUIRED
        transactions,
        txCount: transactions.length, // REQUIRED
        nonce,
        difficulty,
        hash
    };
}


// ==============================
// EXPORT
// ==============================
module.exports = mineBlock;