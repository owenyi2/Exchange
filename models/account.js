const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    cash: {type: Schema.Types.Decimal128, required: true, default: 10000},
    open_orders: [{type: Schema.Types.ObjectId, ref: "Order"}],
    account_enabled: {type: Boolean, required: true, default: true},
    api_key_hash: {type: String, required: true},
    net_position: {type: Number, required: true}
})

module.exports = mongoose.model("Account", AccountSchema);