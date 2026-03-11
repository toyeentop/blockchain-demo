const fs = require('fs');
const csv = require('csv-parser');

function loadFlights() {
    const flights = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream('UAV_Flight_Log.csv')
            .pipe(csv())
            .on('data', (row) => {
                const flight = {
                    timestamp: row["Timestamp"],
                    department: row["Department:"],
                    drone: row["Drone Make & Model:"],
                    location: row["Location (Area Surveyed):"],
                    startTime: row["Start Time:"],
                    endTime: row["End Time:"],
                    dataCollected: row["Type of Data Collected:"]
                };

                flights.push(flight);
            })
            .on('end', () => {
                resolve(flights);
            })
            .on('error', reject);
    });
}

module.exports = loadFlights;