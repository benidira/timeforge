# @castov/sdk

The official Node.js / JavaScript SDK for Castov – The Developer Toolkit.

Bring the power of Castov's zero-server, blazing-fast utilities directly into your own applications.

## Installation

```bash
npm install @castov/sdk
```

## Usage

```javascript
import { castov } from '@castov/sdk';

// Generate UUID
const id = castov.uuid();

// Base64
const encoded = castov.encodeBase64("Hello World");
const decoded = castov.decodeBase64(encoded);

// Time
const now = castov.currentUnix();
const iso = castov.unixToIso(now);

// Hashing
const secureHash = castov.hash("my_password", "sha256");
```

Build faster with Castov.
