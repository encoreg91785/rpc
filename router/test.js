"use strict"
const router = require('express').Router();

router.post('/', (req, res) => {
    res.json({ code: 0, data: "成功" });
})

module.exports.router = router;