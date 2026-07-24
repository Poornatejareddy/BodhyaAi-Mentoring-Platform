# Debug Instructions for Risk Calculation Issue

## Problem
Frontend always shows "Medium Risk" even after clicking "Update Risk", despite risk-svc working correctly.

## Debug Logging Added

I've added verbose logging to trace the complete request flow:

### Files Modified
1. `backend/src/services/riskService.js` - Logs all calls to risk-svc
2. `backend/src/controllers/mentorController.js` - Logs the calculate-risk endpoint execution

### Log Indicators

| Log Message | Meaning |
|------------|---------|
| `🚀 [CALCULATE-RISK] START` | Backend endpoint was called |
| `📋 [CALCULATE-RISK] Student found` | Student data retrieved from database |
| `📡 [RISK-SERVICE] Calling risk-svc` | About to call risk microservice |
| `✅ [RISK-SERVICE] Got response` | risk-svc responded (check prediction value) |
| `💾 [CALCULATE-RISK] Saving student` | About to save to database (check prediction value) |
| `🏁 [CALCULATE-RISK] END` | Successfully completed |
| `❌ [CALCULATE-RISK] ERROR` | Something failed |

## Steps to Debug

1. **Open Backend Terminal** (where `npm run dev` runs in `backend/` directory)
2. **Clear terminal or scroll to bottom**
3. **Open Frontend** → Student Profile → Click "Update Risk"
4. **Copy ALL backend terminal output** (look for emoji indicators above)
5. **Share the complete log output**

## Expected vs Actual

### If Working Correctly:
```
🚀 [CALCULATE-RISK] ========== START ==========
...
✅ [RISK-SERVICE] Got response: {"prediction": "High", ...}
💾 [CALCULATE-RISK] Saving student with prediction: "High"
🏁 [CALCULATE-RISK] ========== END ==========
```

### If No Logs Appear:
- Frontend isn't calling backend (check browser console for errors)
- Authentication issue
- Route problem

### If Logs Show "Medium":
- risk-svc might be returning Medium (but my direct test showed High)
- Timing issue with model reload
- Wrong data being sent to risk-svc

## Share This
Copy the complete terminal output and share it to diagnose the exact problem.
