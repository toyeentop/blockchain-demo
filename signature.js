const EC = require('elliptic').ec;
const crypto = require('crypto');

const ec = new EC('secp256k1');

// ==============================
// CREATE FIXED CITY ISSUER KEY
// ==============================

// Generate ONCE (in real system you'd store this)
const issuerKey = ec.genKeyPair();
const privateKey = issuerKey.getPrivate('hex');
const publicKey = issuerKey.getPublic('hex');


// ==============================
// HASH FUNCTION
// ==============================

function hashTransaction(transaction) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(transaction))
        .digest('hex');
}


// ==============================
// SIGN TRANSACTION
// ==============================

function signTransaction(txObject) {

    const key = ec.genKeyPair();

    const privateKey = key.getPrivate('hex');
    const publicKey = key.getPublic('hex');

    // ✅ SIGN txHash (NOT raw object)
    const signature = key.sign(txObject.txHash).toDER('hex');

    return {
        ...txObject,
        signature,
        publicKey
    };
}


// ==============================
// VERIFY SIGNATURE
// ==============================

function verifySignature(txObject) {

    const key = ec.keyFromPublic(txObject.publicKey, 'hex');

    return key.verify(txObject.txHash, txObject.signature);
}


module.exports = {
    signTransaction,
    verifySignature
};