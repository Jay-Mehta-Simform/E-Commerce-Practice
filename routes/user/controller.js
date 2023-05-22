const { userDataPath } = require("../../config-files/const")
const { readFile } = require("fs/promises")

exports.getUsers = async function getUsers(req, res, next) {
	let users = await readFile(userDataPath)
	let usersJson = JSON.parse(users)
	res.json(usersJson)
}

exports.getUserById = async function (req, res, next) {
	let users = JSON.parse(await readFile(userDataPath))
	let user = users.find((user) => user.id == req.params.id)
	if (user == undefined) return res.sendStatus(404)
	res.json(user)
}
