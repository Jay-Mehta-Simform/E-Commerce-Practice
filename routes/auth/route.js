const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const { signIn, signUp, refreshToken, deleteToken } = require("./controller")

router.post("/signIn", body("name").notEmpty().isAlphanumeric(), body("password").notEmpty(), signIn)
router.post("/signUp", signUp)
router.post("/refreshToken", refreshToken)
router.delete("/deleteToken", deleteToken)

module.exports = router
