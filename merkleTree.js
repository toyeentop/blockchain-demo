const crypto = require('crypto');

function hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function buildMerkleTree(transactions) {

    let hashes = transactions.map(tx => hash(JSON.stringify(tx)));

    while (hashes.length > 1) {

        let newLevel = [];

        for (let i = 0; i < hashes.length; i += 2) {

            if (i + 1 < hashes.length) {
                newLevel.push(hash(hashes[i] + hashes[i + 1]));
            } else {
                newLevel.push(hash(hashes[i] + hashes[i]));
            }

        }

        hashes = newLevel;
    }

    return hashes[0];
}

module.exports = buildMerkleTree;