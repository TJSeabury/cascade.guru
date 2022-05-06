import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { login } from "../../../lib/authorization"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                username: { label: "Email", type: "text", placeholder: "wickedfirename@emailer.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await login(credentials?.username, credentials?.password)
                console.log(user);
                if (user) {
                    return user
                }
                return null
            }
        }),
    ],
    theme: {
        colorScheme: "light",
    },
    callbacks: {
        async jwt({
            token,
            user
        }) {
            if (user) {
                if (user.userRole === 'admin') {
                    token.userRole = "admin"
                } else {
                    token.userRole = "user"
                }
            }

            return token
        },
    },
})
