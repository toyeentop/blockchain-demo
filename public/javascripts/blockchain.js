// ==========================
// LOAD BLOCKCHAIN (CARDS)
// ==========================
async function loadChain() {
    const res = await fetch('/api/chain');
    const data = await res.json();

    const container = document.getElementById('blockCards');
    container.innerHTML = '';

    data.forEach(block => {
        const div = document.createElement('div');
        div.className = "col-md-3";

        div.innerHTML = `
            <div class="panel panel-default" style="cursor:pointer;">
                <div class="panel-heading">
                    <strong>Block ${block.index}</strong>
                </div>
                <div class="panel-body">
                    <small>${block.hash.substring(0, 20)}...</small><br>
                    TX Count: ${block.txCount}
                </div>
            </div>
        `;

        div.onclick = () => loadBlock(block.hash);

        container.appendChild(div);
    });
}

// ==========================
// LOAD BLOCK DETAILS (TABLE)
// ==========================
async function loadBlock(hash) {
    const res = await fetch(`/api/block/${hash}`);
    const block = await res.json();

    const table = document.getElementById('blockTable');
    table.innerHTML = '';

    block.transactions.forEach(tx => {
        const row = `
            <tr>
                <td>${tx.flight_id}</td>
                <td>${tx.department}</td>
                <td>${tx.drone_make_model}</td>
                <td>${tx.location_area_surveyed}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// ==========================
// DATASET SEARCH + DATE FILTER
// ==========================
async function searchData() {
    const query = document.getElementById('search').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const res = await fetch('/api/chain');
    const chain = await res.json();

    let results = [];

    for (const block of chain) {
        const full = await fetch(`/api/block/${block.hash}`);
        const b = await full.json();

        b.transactions.forEach(tx => {

            const txDate = new Date(tx.timestamp);

            const matchesQuery =
                JSON.stringify(tx).toLowerCase().includes(query);

            const matchesDate =
                (!startDate || txDate >= new Date(startDate)) &&
                (!endDate || txDate <= new Date(endDate));

            if (matchesQuery && matchesDate) {
                results.push(tx);
            }
        });
    }

    const table = document.getElementById('datasetTable');
    table.innerHTML = '';

    results.forEach(tx => {
        const row = `
            <tr>
                <td>${tx.flight_id}</td>
                <td>${tx.department}</td>
                <td>${tx.drone_make_model}</td>
                <td>${tx.location_area_surveyed}</td>
                <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// ==========================
// GET MERKLE PROOF
// ==========================
async function getProof() {
    const txHash = document.getElementById('txHash').value;

    const res = await fetch(`/api/proof/${txHash}`);
    const data = await res.json();

    if (data.error) {
        document.getElementById('proofResult').innerText = "❌ Not found";
        return;
    }

    window.currentProof = data;

    document.getElementById('proofResult').innerText =
        JSON.stringify(data, null, 2);
}

// ==========================
// VERIFY TRANSACTION
// ==========================
async function verifyTx() {

    if (!window.currentProof) {
        document.getElementById('verifyResult').innerText =
            "⚠️ Get proof first!";
        return;
    }

    const txHash = document.getElementById('txHash').value;

    const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            txHash,
            proof: window.currentProof.proof,
            merkleRoot: window.currentProof.merkleRoot
        })
    });

    const data = await res.json();

    document.getElementById('verifyResult').innerText =
        data.valid
            ? "✅ VALID TRANSACTION"
            : "❌ INVALID TRANSACTION";
}