const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function signTransaction(transaction) {

    const key = ec.genKeyPair();

    const privateKey = key.getPrivate('hex');
    const publicKey = key.getPublic('hex');

    const signature = key.sign(JSON.stringify(transaction)).toDER('hex');

    return {
        transaction,
        signature,
        publicKey
    };
}

module.exports = signTransaction;