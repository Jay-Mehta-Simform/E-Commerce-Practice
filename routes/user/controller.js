const { userDataPath } = require("../../config/const")
const { readFile } = require("fs/promises")

exports.getUsers = async function getUsers(req, res, next) {
	let users = await readFile(userDataPath)
	let usersJson = JSON.parse(users)
	res.json(usersJson.filter((user) => user.id == req.body.user.id))
}
