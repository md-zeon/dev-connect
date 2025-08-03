import { loginUser } from "@/app/actions/auth/loginUser";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import dbConnect, { collectionNamesObj } from "./dbConnect";

export const authOptions = {
	providers: [
		// Email/password login
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text", placeholder: "example@email.com" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const user = await loginUser(credentials); // you'll build this next
				if (user) return user;
				return null;
			},
		}),

		// Google login
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],

	pages: {
		signIn: "/login", // Custom login page
	},

	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider !== "credentials") {
				const { providerAccountId, provider } = account;
				const { email, name, image } = user;

				const userCollection = await dbConnect(collectionNamesObj.users);
				const existing = await userCollection.findOne({ providerAccountId });

				if (!existing) {
					await userCollection.insertOne({
						providerAccountId,
						provider,
						email,
						name,
						image,
						role: "collaborator", // default role
						createdAt: new Date(),
					});
				}
			}

			return true;
		},

		async session({ session }) {
			const userCollection = await dbConnect(collectionNamesObj.users);
			const dbUser = await userCollection.findOne({ email: session.user.email });

			session.user.id = dbUser?._id?.toString();
			session.user.role = dbUser?.role || "collaborator";

			return session;
		},

		async jwt({ token, user }) {
			if (user) {
				token.id = user._id?.toString();
				token.role = user.role || "collaborator";
			}
			return token;
		},
	},

	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
	},
};
