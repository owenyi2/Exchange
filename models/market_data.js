const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const MarketDataSchema = new Schema({
    operation: {type: String, required: true, enum: ["Insert", "Cancel"]},
    side: {type: String, enum: ["A", "B"]},
    volume: {type: Number},
    account: {type: Schema.Types.ObjectId, ref: "Account"},
    price: {type: Schema.Types.Decimal128}
}, {timestamps: true})

module.exports = new mongoose.model("Market_Data", MarketDataSchema, "market_data");