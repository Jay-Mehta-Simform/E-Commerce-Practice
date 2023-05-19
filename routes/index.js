var express = require("express")
var router = express.Router()
const userRoute = require("./user/index")
const authRoute = require("./auth/index")

router.use("/user", userRoute)
router.use("/auth", authRoute)

module.exports = router
