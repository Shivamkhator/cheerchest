import NextAuth, { DefaultSession, NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import nodemailer from "nodemailer";
import User from "@/db/models/User";
import OTP from "@/db/models/OTP";
import clientPromise from "@/db/connectDb";

// Extend next-auth session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"]
  }

  interface User {
    username: string;
  }
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        const user = await User.findOne({ email: profile.email });
        
        // If the user does not exist, create a new one
        if (!user) {
          const newUser = await User.create({
            email: profile.email,
            username: profile.email.split('@')[0], // Generate username from email
            name: profile.name || profile.email.split('@')[0], // Use email as fallback for name
          });
          
          return {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            username: newUser.username,
            image: profile.picture,
          };
        }
        
        // Return existing user
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.otp) {
            throw new Error("Email and OTP required");
          }

          const email = credentials.email.trim().toLowerCase();
          const otp = credentials.otp.trim();

          console.log("Validating OTP for email:", email);
          console.log("Received OTP:", otp);

          await clientPromise;

          const otpDoc = await OTP.findOne({
            email,
            expires: { $gt: new Date() },
          });

          console.log("Fetched OTP Document:", otpDoc);

          if (!otpDoc) {
            console.error("No OTP document found or OTP expired.");
            throw new Error("Invalid or expired OTP");
          }

          if (otpDoc.otp !== otp) {
            console.error("Provided OTP does not match stored OTP.");
            throw new Error("Invalid or expired OTP");
          }

          // Delete used OTP
          await OTP.deleteOne({ _id: otpDoc._id });

          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              email,
              username: email.split('@')[0],
            });
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function sendOTP(email: string) {
  const otp = generateOTP();

  await clientPromise;

  await OTP.deleteMany({ email });

  await OTP.create({
    email,
    otp,
    expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  });

  await transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: "Your Authentication OTP",
    html: `
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #8672FF;">Your Authentication OTP</h2>
        <p style="font-size: 24px; font-weight: bold; color: #2E2B41; margin: 20px 0;">
          ${otp}
        </p>
        <p style="color: #666;">This OTP will expire in 5 minutes.</p>
      </div>
    `,
  });

  return true;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
