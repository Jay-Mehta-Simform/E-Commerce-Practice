const express = require("express")
const router = express.Router()
const { signIn, signUp, refreshToken, deleteToken } = require("./controller")

router.post("/signIn", signIn)
router.post("/signUp", signUp)
router.post("/refreshToken", refreshToken)
router.delete("/deleteToken", deleteToken)

module.exports = router
