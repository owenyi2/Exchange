const express = require("express");
const router = express.Router();

const account_controller = require("../controllers/account")

router.get("/:id", account_controller.account_by_id_get);

module.exports = router;