const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    side: {type: String, required: true, enum: ["A", "B"]},
    volume: {type: Number, required: true},
    account: {type: Schema.Types.ObjectId, ref: "Account"},
    price: {type: Schema.Types.Decimal128, required: true}
}, {timestamps: true})

module.exports = new mongoose.model("Order", OrderSchema);