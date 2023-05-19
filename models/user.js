class User {
	constructor(name, role = "user", password) {
		this.id = Math.random()
		this.name = name
		this.role = role
		this.password = password
	}
}

module.exports = User
