<div align="center">
<img width="1200" height="475" alt="TkpayBD Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# TkpayBD - Merchant Payment Gateway & Dashboard

TkpayBD Official Merchant Dashboard, Partner Agent Control Panel, and Payment Gateway integration for Bangladesh (bKash, Nagad, Rocket, USDT).

## 🚀 Live Access
- **Merchant Login:** `https://yourdomain.com/merchant/login.php` or `https://yourdomain.com/merchant/login.html`
- **Official Website:** [tkpaybd.site](https://tkpaybd.site)

## 📁 Repository Structure
- `merchant/`
  - `login.html`: Standalone mobile & desktop friendly merchant login page.
  - `index.html`: Direct folder route for `yourdomain.com/merchant/`.
  - `login.php`: PHP fallback endpoint for hosting environments.
  - `logo.jpg`: Brand logo asset.
- `src/`: Complete React TypeScript merchant portal source code (Dashboard, Deposit, Withdraw, Admin Panel, API Keys).
- `public/`: Static web assets, logos, and entry templates.
- `server.ts`: Express backend server implementation.

## 🛠️ How to Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## 📦 How to Build for Production
```bash
npm run build
```
