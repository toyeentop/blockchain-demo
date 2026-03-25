const crypto = require('crypto');

function hash(data) {
    return crypto.createHash('sha256').update(String(data)).digest('hex');
}

// Build full tree (not just root)
function buildMerkleTree(txHashes) {
    let tree = [txHashes];

    while (tree[tree.length - 1].length > 1) {
        const currentLevel = tree[tree.length - 1];
        const nextLevel = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1] || left; // duplicate if odd

            nextLevel.push(hash(left + right));
        }

        tree.push(nextLevel);
    }

    return tree;
}

// Get Merkle root
function getMerkleRoot(tree) {
    return tree[tree.length - 1][0];
}

// Generate proof
function getMerkleProof(txHashes, targetHash) {
    let tree = buildMerkleTree(txHashes);
    let index = txHashes.indexOf(targetHash);

    if (index === -1) return null;

    let proof = [];

    for (let level = 0; level < tree.length - 1; level++) {
        const currentLevel = tree[level];

        const isRightNode = index % 2;
        const pairIndex = isRightNode ? index - 1 : index + 1;

        const sibling = currentLevel[pairIndex] || currentLevel[index];

        proof.push({
            position: isRightNode ? 'left' : 'right',
            hash: sibling
        });

        index = Math.floor(index / 2);
    }

    return proof;
}

// Verify proof
function verifyMerkleProof(txHash, proof, root) {
    let computedHash = txHash;

    for (let step of proof) {
        if (step.position === 'left') {
            computedHash = hash(step.hash + computedHash);
        } else {
            computedHash = hash(computedHash + step.hash);
        }
    }

    return computedHash === root;
}

module.exports = {
    buildMerkleTree,
    getMerkleRoot,
    getMerkleProof,
    verifyMerkleProof
};