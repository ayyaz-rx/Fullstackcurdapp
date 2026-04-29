export type Role = "admin" | "editor" | "viewer";

export interface IUser {
	id: string;
	name?: string;
	email: string;
	role: Role;
	isSuperAdmin?: boolean;
	permissions?: string[];
}

export interface IAdminUser extends Omit<IUser, "id"> {
	_id: string;
}

export interface IPost {
	_id: string;
	title: string;
	content: string;
	authorId?: string;
	authorName?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface IAuthResponse {
	message?: string;
	token?: string;
	user?: IUser;
	error?: string;
}

export interface IPostsResponse {
	posts: IPost[];
	error?: string;
}

export interface IPostResponse {
	post?: IPost;
	message?: string;
	error?: string;
}

