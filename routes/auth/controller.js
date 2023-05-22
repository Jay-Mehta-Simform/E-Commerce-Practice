// const fs = require("fs")
const { readFile, writeFile } = require("fs/promises")
const jwt = require("jsonwebtoken")
const User = require("../../models/user")
const { userDataPath, tokenDataPath } = require("../../config-files/const")

exports.signIn = async (req, res, next) => {
	let users = await readFile(userDataPath)
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))
	let usersJson = JSON.parse(users)
	let user = usersJson.find((iterator) => iterator.name == req.body.name)
	if (user) {
		let accessToken = generateAccessToken(user)
		let refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
		refreshTokens.push(refreshToken)
		await writeFile(tokenDataPath, JSON.stringify(refreshTokens))
		res.status(200).json({ accessToken: accessToken, refreshToken: refreshToken })
	} else res.status(401).send("Not a user!")
}

exports.signUp = async (req, res, next) => {
	let data = await readFile(userDataPath)

	let jsonData = JSON.parse(data)
	jsonData.push(new User(req.body.name, req.body.role, req.body.password))

	await writeFile(userDataPath, JSON.stringify(jsonData))

	res.status(200).send("User Added")
}

exports.deleteToken = async (req, res, next) => {
	const refreshToken = req.body.token
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
	await writeFile(tokenDataPath, JSON.stringify(refreshTokens))
	res.sendStatus(204)
}

exports.refreshToken = async (req, res, next) => {
	const refreshToken = req.body.token
	let refreshTokens = JSON.parse(await readFile(tokenDataPath))
	if (refreshToken == null) return res.sendStatus(401)
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		const accessToken = generateAccessToken({ id: user.id, name: user.name, role: user.role, password: user.password })
		res.json(accessToken)
	})
}

exports.authenticateToken = (req, res, next) => {
	const token = req.headers["authorization"]
	if (token == null) return res.sendStatus(401)
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403)
		req.body.user = user
		next()
	})
}

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.SESSION_TIME })
}
