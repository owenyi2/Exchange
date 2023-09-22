const Account = require("../models/account");
const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const Hashes = require('jshashes');


exports.authenticate_order = asyncHandler(async (req, res, next) => {
    const SHA256 = new Hashes.SHA256
    const account = await Account.findById(req.body.account).lean();

    if (!req.headers.api_key || account.api_key_hash !== SHA256.hex(req.headers.api_key) || !account.account_enabled) {
        res.status(401).json({error: 'unauthorised'})
    }
    else {
        next();
    }
})

exports.check_valid_order = asyncHandler(async(req, res, next) => {
    const max_open_orders = 10;

    const account = await Account.findById(req.body.account, "open_orders").populate("open_orders").lean();
    const open_orders = account.open_orders

    if (open_orders.length >= max_open_orders) {
        res.status(403).json({error: 'exceeds allowed maximum number of open orders'})
    }
    else {
        let possible_wash_orders = []
        if (req.body.side == "B") {
            possible_wash_orders = open_orders.filter((order) => order.side == "A" && order.price <= req.body.price)
        }  
        else if (req.body.side == "A") {
            possible_wash_orders = open_orders.filter((order) => order.side == "B" && order.price >= req.body.price)
        }

        console.log(await Order.find({}))

        if (possible_wash_orders.length > 0) {
            res.status(403).json({error: 'no wash orders are allowed'})
        }
        else{       
            next()
        }   
    }
})

exports.check_order_exists = asyncHandler(async (req, res, next) => {
    const open_orders = await Order.find({_id : req.params.id, account: req.body.account}).exec()
    
    if (open_orders.length > 0) {
        next()
    }
    else {
        res.status(404).json({error: "order does not exist"})
    }
})