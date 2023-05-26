var express = require("express")
var router = express.Router()
const userRoute = require("./user/index")
const authRoute = require("./auth/index")

router.get("/", (req, res, next) => {
	res.render("index.ejs", { title: "HELLO" })
})
router.use("/user", userRoute)
router.use("/auth", authRoute)

module.exports = router
