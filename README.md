🚁 Drone Blockchain System

A full-stack blockchain-based system for securing, verifying, and visualizing drone flight data.

This project demonstrates how blockchain principles such as hashing, Merkle Trees, Proof-of-Work, and chain immutability can be applied to real-world data systems.

📌 Features
🔗 Blockchain construction with Proof-of-Work
🌳 Merkle Tree implementation for efficient verification
🔐 Transaction hashing and digital signatures
🔍 Block Explorer for inspecting blockchain data
📊 Dataset Explorer for drone flight records
✅ Flight verification using Merkle proofs
🔥 Real-time tamper detection (interactive UI)
🔀 Fork simulation with longest-chain resolution
🛠️ Installation & Setup
1. Clone the repository

git clone https://github.com/toyeentop/blockchain-demo.git

cd blockchain-demo

2. Install Dependencies

npm install

3. Start Server

npm start

4. Open in Browser

http://localhost:3000

📊 Dataset Ingestion

Drone flight data is automatically ingested when the server starts.

The system:

Loads drone flight dataset
Converts each record into a structured transaction
Applies canonicalization for consistent hashing
Generates a SHA-256 hash for each transaction
Groups transactions into blocks

No manual ingestion command is required.

⛓️ Blockchain Design
Transactions are grouped into blocks
Each block contains:
Index
Transactions
Merkle Root
Previous Hash
Nonce
Block Hash
Blocks are mined using Proof-of-Work
Each block links to the previous block using its hash
🌳 Merkle Tree & Verification
Transactions are hashed and organized into a Merkle Tree
A Merkle Root is stored in each block

The system supports:

Merkle proof generation
Efficient transaction verification
🔍 API Endpoints
Endpoint	Description
/api/chain	Get blockchain summary
/api/block/:hash	Get full block details
/api/tx/:txHash	Find transaction
/api/proof/:txHash	Generate Merkle proof
/api/verify	Verify transaction
/api/validate	Validate blockchain integrity
/api/tamper	Simulate tampering
🧪 Validation and Testing
UI-Based Testing
Open Blockchain Explorer
Modify any Previous Hash
Observe:
First block becomes invalid
All subsequent blocks break
API Validation

GET /api/validate

Validates:

Block linkage
Hash correctness
Merkle root integrity
Transaction validity
🔥 Tamper Detection

The system detects tampering by:

Recomputing transaction hashes
Verifying Merkle root consistency
Checking block hash integrity
Ensuring correct previous hash linkage

Any modification propagates through the chain and invalidates all subsequent blocks.

🔀 Fork Simulation

The system includes a visual simulation of blockchain forks.

Chain A (shorter)
Chain B (longer)

The system selects the longest chain as valid.

This demonstrates the Longest Chain Rule used in blockchain consensus.

🌐 Multi-Node Setup (Conceptual)

This implementation operates as a single-node blockchain system.

In a real-world system:

Multiple nodes maintain copies of the blockchain
Nodes communicate over a network
Consensus algorithms resolve conflicts

Fork resolution is demonstrated through simulation.

🖥️ User Interface Modules
Dataset Explorer – Browse drone data
Block Explorer – Inspect blocks and transactions
Blockchain UI – Interactive tamper visualization
Verify Flight – Validate transactions
🚀 Technologies Used
Node.js
Express.js
Pug
JavaScript
CryptoJS
📌 Conclusion

This system demonstrates how blockchain can:

Secure operational data
Detect unauthorized modifications
Enable efficient verification
Maintain trust in distributed systems
📜 License

This project is for academic and demonstration purposes.