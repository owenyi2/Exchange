const Account = require("../models/account");
const Order = require("../models/order");
const MarketData = require("../models/market_data")
const asyncHandler = require("express-async-handler");

exports.post_new_order = asyncHandler(async (req, res, next) => {
    // add to market information database
    await MarketData.create({
        operation: "Insert",
        side: req.body.side,
        volume: req.body.volume,
        account: req.body.account,
        price: req.body.price
    })

    // clear orders
    let current_volume = req.body.volume
    let aggressor = await Account.findById(req.body.account)

    if (req.body.side == "A") {
        let ask_price = req.body.price
        let open_orders = await Order.find({"side": "B", "price": {"$gte": req.body.price}}).sort({"price": "desc", "createdAt": "asc"})
    
        while (current_volume > 0 && open_orders.length >0 ) {
            best_order = open_orders[0]
            if (best_order !== undefined && best_order.price >= ask_price) { // transaction will occur
                let counter_party = await Account.findById(best_order.account)
                let cleared_order = open_orders.shift()

                let price = parseFloat(best_order.price)
                let volume = Math.min(best_order.volume, current_volume)

                aggressor.cash = parseFloat(aggressor.cash) + price * volume
                aggressor.net_position -= volume

                counter_party.cash = parseFloat(counter_party.cash) - price * volume
                counter_party.net_position += volume
       
                current_volume -= volume
                cleared_order.volume -= volume

                if (cleared_order.volume == 0) {
                    await Order.findByIdAndDelete(cleared_order.id)
                    await Account.findByIdAndUpdate({_id: counter_party.id}, {$pull: {open_orders: cleared_order.id}})
                }
                
                await counter_party.save()
            }
        }
    }
    else if (req.body.side == "B") {
        let bid_price = req.body.price
        let open_orders = await Order.find({"side": "A", "price": {"$lte": req.body.price}}).sort({"price": "asc", "createdAt": "asc"})
    
        while (current_volume > 0 && open_orders.length >0 ) {
            best_order = open_orders[0]
            if (best_order !== undefined && best_order.price <= bid_price) { // transaction will occur
                let counter_party = await Account.findById(best_order.account)
                let cleared_order = open_orders.shift()

                let price = parseFloat(best_order.price)
                let volume = Math.min(best_order.volume, current_volume)

                aggressor.cash = parseFloat(aggressor.cash) - price * volume
                aggressor.net_position += volume

                counter_party.cash = parseFloat(counter_party.cash) + price * volume
                counter_party.net_position -= volume
       
                current_volume -= volume
                cleared_order.volume -= volume

                if (cleared_order.volume == 0) {
                    await Order.findByIdAndDelete(cleared_order.id)
                    await Account.findByIdAndUpdate({_id: counter_party.id}, {$pull: {open_orders: cleared_order.id}})
                }
                
                await counter_party.save()
            }
        }
    }
    await aggressor.save()

    // add to open_orders and account
    if (req.body.volume > 0) {
        const new_order = new Order(req.body)

        await new_order.save()
        await Account.findByIdAndUpdate({_id: req.body.account}, {$push: {open_orders: new_order._id}})

        
    }
    res.status(201).json({"success": true})
})

exports.delete_order = asyncHandler(async(req, res, next) => {
    await Order.findByIdAndDelete(req.params.id).exec()

    res.status(202).json({success: true})
})