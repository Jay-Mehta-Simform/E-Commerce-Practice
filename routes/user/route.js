var express = require("express")
var router = express.Router()
const { getUsers } = require("../user/controller")
const { authenticateToken } = require("../auth/controller")

/* GET users listing. */
router.get("/", authenticateToken, getUsers)

module.exports = router
