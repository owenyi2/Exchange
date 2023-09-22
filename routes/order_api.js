const express = require("express");
const router = express.Router();

const order_middleware = require("../middlewares/order");
const order_controller = require("../controllers/order")

router.post("/new", [order_middleware.authenticate_order, order_middleware.check_valid_order, order_controller.post_new_order])

router.delete("/:id([0-9a-zA-Z]{24})", [order_middleware.authenticate_order, order_middleware.check_order_exists, order_controller.delete_order])

module.exports = router;