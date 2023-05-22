var express = require("express")
var router = express.Router()
const { getUsers, getUserById } = require("../user/controller")
const { authenticateToken } = require("../auth/controller")

/* GET users listing. */
router.get("/", authenticateToken, getUsers)

router.get("/:id", authenticateToken, getUserById)

router.get("/:id", authenticateToken, getUserById)

module.exports = router
