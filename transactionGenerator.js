function generateTransactions(flights) {

    const transactions = flights.map((flight, index) => {
        return {
            id: "FLIGHT_" + (index + 1),
            drone: flight.drone,
            department: flight.department,
            location: flight.location,
            start: flight.startTime,
            end: flight.endTime,
            dataType: flight.dataCollected
        };
    });

    return transactions;
}

module.exports = generateTransactions;