const express = require("express")
const router = express.Router()
const { signIn, signUp, refreshToken } = require("./controller")

router.post("/signIn", signIn)
router.post("/signUp", signUp)
router.post("/refreshToken", refreshToken)

module.exports = router
