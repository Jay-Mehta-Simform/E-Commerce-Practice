const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const { signIn, signUp, refreshToken, deleteToken } = require("./controller")

router.post("/signIn", body("name").notEmpty().isAlphanumeric(), body("password").notEmpty(), signIn)

router.post(
	"/signUp",
	body("name").notEmpty().isAlpha(),
	body("role").notEmpty().isIn(["user", "admin"]),
	body("password").notEmpty().isLength({ min: 5 }),
	body("confirm").notEmpty(),
	signUp
)

router.post("/refreshToken", body("token").notEmpty(), refreshToken)

router.delete("/deleteToken", body("token").notEmpty(), deleteToken)

module.exports = router
