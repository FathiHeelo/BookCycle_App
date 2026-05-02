"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndIncrementUsage = void 0;
const admin = __importStar(require("firebase-admin"));
async function checkAndIncrementUsage(uid) {
    const date = new Date().toISOString().split('T')[0];
    const usageRef = admin.database().ref(`users/${uid}/aiUsage/${date}`);
    const snapshot = await usageRef.get();
    const currentUsage = snapshot.val() || 0;
    const LIMIT = 3;
    if (currentUsage >= LIMIT) {
        return { allowed: false, remaining: 0 };
    }
    const newUsage = currentUsage + 1;
    await usageRef.set(newUsage);
    return { allowed: true, remaining: LIMIT - newUsage };
}
exports.checkAndIncrementUsage = checkAndIncrementUsage;
//# sourceMappingURL=usageLimit.js.map