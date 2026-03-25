const crypto = require('crypto');

function hashTransaction(tx) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(tx))
        .digest('hex');
}

// OPTIONAL: sort keys for canonicalization
function canonicalize(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}

function generateTransactions(flights) {

    const transactions = flights.map((flight, index) => {

        const tx = {
            flight_id: "FLIGHT_" + (index + 1),
            timestamp: new Date().toISOString(), // normalize time
            department: flight.department,
            drone_make_model: flight.drone,
            location_area_surveyed: flight.location,
            start_time: flight.startTime,
            end_time: flight.endTime,
            data_collected: flight.dataCollected,

            // reproducibility fields
            source_url: "Bloomington UAV Dataset",
            snapshot_hash: "STATIC_HASH_PLACEHOLDER"
        };

        // canonical form (sorted keys)
        const canonicalTx = canonicalize(tx);

        // generate txHash
        const txHash = hashTransaction(canonicalTx);

        return {
            ...canonicalTx,
            txHash
        };
    });

    return transactions;
}

module.exports = generateTransactions;