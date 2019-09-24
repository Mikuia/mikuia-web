declare namespace Express {
	interface User {
		id: string;
	}

	interface Request {
		user?: User
	}
}
