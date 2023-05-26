const { readFile, writeFile } = require("fs/promises")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const { validationResult } = require("express-validator")
const User = require("../../models/user")
const { userDataPath, tokenDataPath } = require("../../config-files/const")

//? Takes in UserName and Password and return Access Token and Refresh Token.
exports.signIn = async (req, res, next) => {
	//Checking the results of Express-Validator middleware
	const validatorResult = validationResult(req)
	if (validatorResult.errors.length != 0) {
		return res.status(400).send(validatorResult.errors[0].msg)
	}

	// Checking if user exists
	let users = JSON.parse(await readFile(userDataPath))
	let user = users.find((iterator) => iterator.name == req.body.name)

	// Reading the list of registered refreshTokens
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))

	if (user) {
		// If user exists, check password
		if (!(await bcrypt.compare(req.body.password, user.password))) {
			return res.status(400).send("Invalid Password")
		}
		// Send Access and Refresh Token
		let accessToken = generateAccessToken(user)
		let refreshToken = refreshTokens.filter((token) => token.id == user.id)[0]
		if (refreshToken == null) {
			refreshToken = { id: user.id }
			refreshToken.token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
			refreshTokens.push(refreshToken)
			try {
				await writeFile(tokenDataPath, JSON.stringify(refreshTokens))
			} catch (error) {
				res.status(500).send("Couldn't write data!")
			}
		}
		res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken })
	} else res.status(401).send("Not a user!")
}

//? Input: name, role and password ----- Output: Confirmation or Error
exports.signUp = async (req, res, next) => {
	let validatorResult = validationResult(req)
	if (validatorResult.errors.length != 0) {
		return res.status(400).json(validatorResult.errors)
	}
	let data = JSON.parse(await readFile(userDataPath))
	if (data.filter((user) => user.name == req.body.name).length != 0) {
		return res.status(409).end("Username Exists!")
	}
	if (req.body.password !== req.body.confirm) {
		return res.status(400).end("Passwords don't match!")
	}
	let password = await bcrypt.hash(req.body.password, process.env.SALT_ROUNDS)

	// Add user
	data.push(new User(req.body.name, req.body.role, password))
	try {
		await writeFile(userDataPath, JSON.stringify(data))
		res.status(200).send("User Added")
	} catch (error) {
		res.status(500).send("Couldn't add user!")
	}
}

//? Input: RefreshToken --- Output: Status Code
exports.deleteToken = async (req, res, next) => {
	let validatorResult = validationResult(req)
	if (validatorResult.errors.length != 0) {
		return res.status(400).json(validatorResult.errors)
	}
	const refreshToken = req.body.token
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))
	refreshTokens = refreshTokens.filter((token) => token.token !== refreshToken)
	try {
		await writeFile(tokenDataPath, JSON.stringify(refreshTokens))
		res.sendStatus(204)
	} catch (error) {
		res.sendStatus(500)
	}
}

//? Input: RefreshToken --- Output: New Access Token
exports.refreshToken = async (req, res, next) => {
	let validatorResult = validationResult(req)
	if (validatorResult.errors.length != 0) {
		return res.status(400).json(validatorResult.errors)
	}
	const refreshToken = req.body.token
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))
	if (refreshToken == null) return res.sendStatus(401)
	if (!refreshTokens.filter((token) => token.token == refreshToken)) return res.sendStatus(403)
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		const accessToken = generateAccessToken({ id: user.id, name: user.name, role: user.role, password: user.password })
		res.json(accessToken)
	})
}

//? Middleware to authenticate user
exports.authenticateToken = (req, res, next) => {
	const token = req.headers["authorization"]
	if (token == null) return res.sendStatus(401)
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		req.body.user = user
		next()
	})
}

//? Utility function to generate JWT Access Token
function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.SESSION_TIME })
}
