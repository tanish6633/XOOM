# Run instructions

1. Install Node.js (LTS) from https://nodejs.org and ensure `npm` is on your PATH.

2. Open PowerShell and run:

```powershell
cd "C:\Users\tanis\Downloads\XOOM"
npm install
copy .env.example .env
# Edit .env as needed (EMAIL_USER, DB_*, etc.)
npm start
```

3. Quick tests:

```powershell
node test_email.js
node test_auth_script.js
```

Notes:
- The project `start` script runs `node server/server.js`.
- If `npm` is not recognized, install Node.js and restart your terminal.
