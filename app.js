const createBlock = require('./block');
const buildMerkleTree = require('./merkleTree');
const signTransaction = require('./signature');
const generateTransactions = require('./transactionGenerator');
const loadFlights = require('./datasetLoader');

const crypto = require('crypto');

var express = require('express');
var i18n = require('i18n');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();


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
app.use(i18n.init);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);


// ==============================
// ERROR HANDLING
// ==============================

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

i18n.configure({
  locales:['en','de','es','fr-CA','hi','ja','ko','nl','pl','pt','zh-CN','hu','id','th'],
  directory: __dirname + '/locales'
});

module.exports = app;



// ==============================
// BLOCKCHAIN FUNCTIONS
// ==============================

function calculateHash(index, timestamp, merkleRoot, previousHash) {

    return crypto
        .createHash('sha256')
        .update(index + timestamp + merkleRoot + previousHash)
        .digest('hex');
}


function validateBlockchain(blockchain) {

    for (let i = 1; i < blockchain.length; i++) {

        const currentBlock = blockchain[i];
        const previousBlock = blockchain[i - 1];

        const merkleRoot = buildMerkleTree(currentBlock.transactions);

        const recalculatedHash = calculateHash(
            currentBlock.index,
            currentBlock.timestamp,
            merkleRoot,
            currentBlock.previousHash
        );

        if (currentBlock.hash !== recalculatedHash) {

            console.log("Block", currentBlock.index, "has been tampered with!");
            return false;

        }

        if (currentBlock.previousHash !== previousBlock.hash) {

            console.log("Blockchain linkage broken at block", currentBlock.index);
            return false;

        }
    }

    return true;
}



function verifyTransactionInBlock(blockchain, transactionId) {

    for (const block of blockchain) {

        const tx = block.transactions.find(
            t => t.transaction.id === transactionId
        );

        if (tx) {

            const merkleRoot = buildMerkleTree(block.transactions);

            console.log(
                `Transaction ${transactionId} found in block ${block.index}`
            );

            return merkleRoot ? true : false;
        }
    }

    return false;
}



// ==============================
// BUILD THE BLOCKCHAIN
// ==============================

loadFlights().then(flights => {

    const transactions = generateTransactions(flights);

    const signedTransactions = transactions.map(tx => signTransaction(tx));

    const merkleRoot = buildMerkleTree(signedTransactions);

    const blockchain = [];

    const blockSize = 20;

    let previousHash = "0000";
    let blockIndex = 1;

    for (let i = 0; i < signedTransactions.length; i += blockSize) {

        const blockTransactions =
            signedTransactions.slice(i, i + blockSize);

        const block = createBlock(
            blockIndex,
            blockTransactions,
            previousHash
        );

        blockchain.push(block);

        previousHash = block.hash;

        blockIndex++;
    }

console.log("\nBlockchain Summary:");
blockchain.forEach(block => {
    console.log(`Block ${block.index} | Tx: ${block.transactions.length} | Hash: ${block.hash.substring(0,10)}...`);
});


    // ==============================
    // OUTPUT
    // ==============================

    console.log("\nMerkle Root:");
    console.log(merkleRoot);


    console.log("\nBlockchain Created:");
    console.dir(blockchain, { depth: null });


    // ==============================
    // VALIDATE CHAIN
    // ==============================

    const isValid = validateBlockchain(blockchain);

    console.log("\nBlockchain valid:", isValid);


    // ==============================
    // VERIFY TRANSACTION
    // ==============================

    const proof = verifyTransactionInBlock(blockchain, "FLIGHT_1");

    console.log("\nTransaction inclusion verified:", proof);

});