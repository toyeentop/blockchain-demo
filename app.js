const blockchainRoutes = require('./routes/blockchain');
const createBlock = require('./block');
const {
    buildMerkleTree,
    getMerkleRoot,
    getMerkleProof,
    verifyMerkleProof
} = require('./merkleTree');

const { signTransaction, verifySignature } = require('./signature');
const generateTransactions = require('./transactionGenerator');
const loadFlights = require('./datasetLoader');

const crypto = require('crypto');

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');

const app = express();

// ==============================
// EXPRESS SETUP
// ==============================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use('/', routes);
app.use('/api', blockchainRoutes);

// ==============================
// HELPER: CANONICALIZE (MUST MATCH GENERATOR)
// ==============================

function canonicalize(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

// ==============================
// HASH FUNCTION
// ==============================

function calculateHash(index, timestamp, previousHash, merkleRoot, nonce) {
    return crypto
        .createHash('sha256')
        .update(index + timestamp + previousHash + merkleRoot + nonce)
        .digest('hex');
}

// ==============================
// VALIDATE BLOCKCHAIN
// ==============================

function validateBlockchain(blockchain) {

    for (let i = 1; i < blockchain.length; i++) {

        const current = blockchain[i];
        const previous = blockchain[i - 1];

        // 🔗 Check chain linkage
        if (current.previousHash !== previous.hash) {
            console.log("❌ Chain broken at block", current.index);
            return false;
        }

        // 🌳 Check Merkle root
        const txHashes = current.transactions.map(tx => tx.txHash);
        const tree = buildMerkleTree(txHashes);
        const root = getMerkleRoot(tree);

        if (current.merkleRoot !== root) {
            console.log("❌ Merkle root mismatch at block", current.index);
            return false;
        }

        // 🔐 Check block hash
        const recalculatedHash = calculateHash(
            current.index,
            current.timestamp,
            current.previousHash,
            current.merkleRoot,
            current.nonce
        );

        if (current.hash !== recalculatedHash) {
            console.log("❌ Block tampered:", current.index);
            return false;
        }

        // ⛏️ Check Proof of Work
        const target = "0".repeat(current.difficulty || 2);
        if (!current.hash.startsWith(target)) {
            console.log("❌ Invalid PoW at block", current.index);
            return false;
        }

        // 🔎 Validate transactions (FIXED)
        for (const tx of current.transactions) {

            const txData = {
                flight_id: tx.flight_id,
                timestamp: tx.timestamp,
                department: tx.department,
                drone_make_model: tx.drone_make_model,
                location_area_surveyed: tx.location_area_surveyed,
                start_time: tx.start_time,
                end_time: tx.end_time,
                data_collected: tx.data_collected,
                source_url: tx.source_url,
                snapshot_hash: tx.snapshot_hash
            };

            const canonicalTx = canonicalize(txData);

            const recalculatedTxHash = crypto
                .createHash('sha256')
                .update(JSON.stringify(canonicalTx))
                .digest('hex');

            if (tx.txHash !== recalculatedTxHash) {
                console.log("❌ Transaction data tampered in block", current.index);
                return false;
            }

            if (!verifySignature(tx)) {
                console.log("❌ Invalid signature in block", current.index);
                return false;
            }
        }
    }

    return true;
}

// ==============================
// VERIFY TRANSACTION
// ==============================

function verifyTransactionInBlock(blockchain, txId) {

    for (const block of blockchain) {
        const found = block.transactions.find(t => t.flight_id === txId);

        if (found) {
            console.log(`Transaction ${txId} found in block ${block.index}`);
            return true;
        }
    }

    return false;
}

// ==============================
// BUILD BLOCKCHAIN
// ==============================

loadFlights().then(flights => {

    const transactions = generateTransactions(flights);
    const signedTransactions = transactions.map(tx => signTransaction(tx));

    const blockchain = [];

    const blockSize = 20;
    const difficulty = 4;

    let previousHash = "0000";
    let index = 1;

    for (let i = 0; i < signedTransactions.length; i += blockSize) {

        const blockTx = signedTransactions.slice(i, i + blockSize);

        const txHashes = blockTx.map(tx => tx.txHash);
        const tree = buildMerkleTree(txHashes);
        const merkleRoot = getMerkleRoot(tree);

        const block = createBlock(index, blockTx, previousHash, difficulty);

        block.merkleRoot = merkleRoot;

        blockchain.push(block);

        previousHash = block.hash;
        index++;
    }

    blockchainRoutes.setBlockchain(blockchain);
    blockchainRoutes.setValidator(validateBlockchain);

    console.log("\n==============================");
    console.log("🚀 BLOCKCHAIN CREATED");
    console.log("==============================");

    // ✅ BEFORE tampering
    const isValid = validateBlockchain(blockchain);
    console.log("\nBlockchain valid:", isValid);

    // ✅ Transaction check
    const txFound = verifyTransactionInBlock(blockchain, "FLIGHT_1");
    console.log("\nTransaction inclusion verified:", txFound);

    // ✅ Merkle proof
    const testBlock = blockchain[1];
    const testTx = testBlock.transactions[0];

    const txHashes = testBlock.transactions.map(tx => tx.txHash);
    const proof = getMerkleProof(txHashes, testTx.txHash);

    console.log("\n🔎 Merkle Proof:");
    console.log(proof);

    const isProofValid = verifyMerkleProof(
        testTx.txHash,
        proof,
        testBlock.merkleRoot
    );

    console.log("\n✅ Merkle Proof Valid:", isProofValid);

    // ==============================
    // ❌ TAMPER TEST
    // ==============================
    //console.log("\n--- TAMPER TEST ---");

    //blockchain[1].transactions[0].department = "HACKED";

   // const tamperedValid = validateBlockchain(blockchain);
    //console.log("Tampered blockchain valid:", tamperedValid);

});

// ==============================
// EXPORT
// ==============================

module.exports = app;
module.exports.validateBlockchain = validateBlockchain;