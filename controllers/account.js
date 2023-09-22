const Account = require("../models/account");

const asyncHandler = require("express-async-handler");

exports.account_by_id_get = asyncHandler(async (req, res, next) => {
    account = await Account.findById(req.params.id).exec();
    res.json(account);
})
 