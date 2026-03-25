const express = require('express');
const router = express.Router();

let blockchain = [];
let validateBlockchainFn = null;   // ✅ ADD THIS

router.setBlockchain = (chain) => {
    blockchain = chain;
};

router.setValidator = (fn) => {    // ✅ ADD THIS
    validateBlockchainFn = fn;
};

// ==============================
// SET BLOCKCHAIN
// ==============================
router.setBlockchain = (chain) => {
    blockchain = chain;
};

// ==============================
// GET CHAIN
// ==============================
router.get('/chain', (req, res) => {
    const headers = blockchain.map(block => ({
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        merkleRoot: block.merkleRoot,
        txCount: block.txCount
    }));

    res.json(headers);
});

// ==============================
// GET BLOCK
// ==============================
router.get('/block/:hash', (req, res) => {
    const block = blockchain.find(b => b.hash === req.params.hash);

    if (!block) {
        return res.status(404).json({ error: 'Block not found' });
    }

    res.json(block);
});

// ==============================
// GET TRANSACTION
// ==============================
router.get('/tx/:txHash', (req, res) => {

    for (const block of blockchain) {
        const tx = block.transactions.find(t => t.txHash === req.params.txHash);

        if (tx) {
            return res.json({
                blockIndex: block.index,
                tx
            });
        }
    }

    res.status(404).json({ error: 'Transaction not found' });
});

// ==============================
// GET MERKLE PROOF
// ==============================
const { getMerkleProof, verifyMerkleProof } = require('../merkleTree');

router.get('/proof/:txHash', (req, res) => {

    for (const block of blockchain) {

        const txHashes = block.transactions.map(tx => tx.txHash);

        if (txHashes.includes(req.params.txHash)) {

            const proof = getMerkleProof(txHashes, req.params.txHash);

            return res.json({
                blockIndex: block.index,
                merkleRoot: block.merkleRoot,
                proof
            });
        }
    }

    res.status(404).json({ error: 'Transaction not found' });
});

// ==============================
// VERIFY PROOF
// ==============================
router.post('/verify', (req, res) => {

    const { txHash } = req.body;

    for (const block of blockchain) {

        const txHashes = block.transactions.map(tx => tx.txHash);

        if (txHashes.includes(txHash)) {

            const proof = getMerkleProof(txHashes, txHash);

            const isValid = verifyMerkleProof(
                txHash,
                proof,
                block.merkleRoot
            );

            return res.json({
                valid: isValid,
                blockIndex: block.index,
                merkleRoot: block.merkleRoot,
                proof
            });
        }
    }

    res.json({
        valid: false,
        error: "Transaction not found"
    });
});

// ==============================
// 🔥 TAMPER + VALIDATE
// ==============================
router.get('/tamper', (req, res) => {

    if (blockchain.length === 0) {
        return res.json({ error: "Blockchain empty" });
    }

    blockchain[1].transactions[0].department = "HACKED";

    console.log("\n--- TAMPER TRIGGERED ---");

    res.json({
        message: "Blockchain tampered. Check console for validation result."
    });
});


// ✅ ADD THIS RIGHT HERE

router.get('/validate', (req, res) => {

    if (!validateBlockchainFn) {
        return res.status(500).json({ error: "Validator not set" });
    }

    const isValid = validateBlockchainFn(blockchain);

    res.json({ valid: isValid });
});

// ==============================
// GET ALL TRANSACTIONS (NEW)
// ==============================
router.get('/transactions', (req, res) => {

    let allTx = [];

    for (const block of blockchain) {
        block.transactions.forEach(tx => {
            allTx.push({
                blockIndex: block.index,
                ...tx
            });
        });
    }

    res.json(allTx);
});

module.exports = router;