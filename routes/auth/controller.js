// const fs = require("fs")
const { readFile, writeFile } = require("fs/promises")
const jwt = require("jsonwebtoken")
const User = require("../../models/user")
const { userDataPath } = require("../../config-files/const")

exports.signIn = async (req, res, next) => {
	let users = await readFile(userDataPath)
	let usersJson = JSON.parse(users)
	let user = usersJson.find((iterator) => iterator.name == req.body.name)
	if (user) {
		let accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
		res.status(200).json({ accessToken: accessToken })
	} else res.status(401).send("Not a user!")
}

exports.signUp = async (req, res, next) => {
	let data = await readFile(userDataPath)

	let jsonData = JSON.parse(data)
	jsonData.push(new User(req.body.name, req.body.role, req.body.password))

	await writeFile(userDataPath, JSON.stringify(jsonData))

	res.status(200).send("User Added")
}

exports.refreshToken = (req, res, next) => {
	res.send("New Token Generated")
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
