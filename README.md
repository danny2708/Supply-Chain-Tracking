# Supply Chain Tracking System

![License](https://img.shields.io/github/license/danny2708/Supply-Chain-Tracking)
![Issues](https://img.shields.io/github/issues/danny2708/Supply-Chain-Tracking)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

A decentralized application (DApp) designed to provide end-to-end visibility and transparency in the supply chain lifecycle. Built on Blockchain technology, this system ensures data integrity, provenance, and real-time tracking from production to the end consumer.

---

## 🌟 Overview

In traditional supply chains, data is often siloed and prone to manipulation. This project leverages **Smart Contracts** to create an immutable ledger where every stakeholder (Manufacturer, Distributor, Retailer, and Consumer) can verify the authenticity and status of goods without relying on a central authority.

## ✨ Key Features

* **Product Provenance:** Record the entire history of a product, including its origin and ownership transfers.
* **Role-Based Access Control:** Distinct functionalities for Manufacturers, Logistics providers, and Customers.
* **Real-time Status Updates:** Track stages such as `Produced`, `In Transit`, `Received`, and `Sold`.
* **Immutable Audit Trail:** Complete transparency for auditors and regulatory bodies to prevent counterfeit goods.
* **Secure Transactions:** All handovers are cryptographically signed and verified on the blockchain.

## 🛠 Tech Stack

| Component            | Technology                        |
|----------------------|-----------------------------------|
| **Smart Contracts** | Solidity                          |
| **Framework** | Hardhat / Truffle                 |
| **Frontend** | React.js / Next.js                |
| **Web3 Library** | Ethers.js / Web3.js               |
| **Local Blockchain** | Ganache / Hardhat Network         |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16.x or later)
* [MetaMask](https://metamask.io/) browser extension
* [Git](https://git-scm.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/danny2708/Supply-Chain-Tracking.git](https://github.com/danny2708/Supply-Chain-Tracking.git)
cd Supply-Chain-Tracking
```
### 2. Install Dependencies

```bash
# Install root / smart contract dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```
### 3. Deploy Smart Contracts
```bash
Terminal 1: Start local blockchain
npx hardhat node

Terminal 2: Deploy smart contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Configure Frontend

Update the deployed contract address in the frontend configuration file:

client/src/utils/constants.js

Replace the existing address with the contract address printed after deployment.

### 5. Run the Application
```bash
cd client
npm start
```

The application will be available at:

http://localhost:3000

📖 Usage Workflow

Manufacturing
The Producer registers a new product and assigns it a unique Product ID on the blockchain.

Logistics
The product status is updated to In Transit, and the carrier identity is recorded.

Retail
The Retailer confirms receipt of the product and verifies integrity.

Consumer Verification
The consumer enters or scans the Product ID to view the full supply chain history.

📜 License

This project is licensed under the MIT License. See the LICENSE file for details.
