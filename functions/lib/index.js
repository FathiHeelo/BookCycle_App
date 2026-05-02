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
exports.generateResourceDescription = exports.analyzeResourceImage = exports.generateResourceImage = void 0;
const admin = __importStar(require("firebase-admin"));
const imageGen_1 = require("./ai/imageGen");
Object.defineProperty(exports, "generateResourceImage", { enumerable: true, get: function () { return imageGen_1.generateResourceImage; } });
const imageAnalysis_1 = require("./ai/imageAnalysis");
Object.defineProperty(exports, "analyzeResourceImage", { enumerable: true, get: function () { return imageAnalysis_1.analyzeResourceImage; } });
const descriptionGen_1 = require("./ai/descriptionGen");
Object.defineProperty(exports, "generateResourceDescription", { enumerable: true, get: function () { return descriptionGen_1.generateResourceDescription; } });
admin.initializeApp();
//# sourceMappingURL=index.js.map