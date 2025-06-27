import jwt from 'jsonwebtoken';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required in environment variables');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            return null;
          }

          const isValid = await user.comparePassword(credentials.password);
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          logger.error('Error in authorize:', err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
    updateAge: 24 * 60 * 60, // обновлять каждые 24 часа при активности
  },
  callbacks: {
    async jwt({ token, user }) {
      // При первом входе (user существует)
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.iat = Math.floor(Date.now() / 1000); // время создания
        token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // истекает через 30 дней
        
        logger.log('New JWT token created for user:', user.email);
        return token;
      }

      // Проверяем, нужно ли обновить токен
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = (token.exp as number) - now;
      
      // Если до истечения меньше 7 дней, обновляем токен
      if (timeLeft < 7 * 24 * 60 * 60) {
        try {
          await dbConnect();
          
          // Проверяем, что пользователь еще существует
          const user = await User.findById(token.id);
          if (!user) {
            logger.log('User not found during token refresh:', token.id);
            // Пользователь удален, помечаем токен как недействительный
            token.exp = now - 1; // Помечаем как истекший
            return token;
          }
          
          // Обновляем токен
          token.iat = now;
          token.exp = now + (30 * 24 * 60 * 60); // новые 30 дней
          
          logger.log('JWT token refreshed for user:', user.email, 'Time left was:', timeLeft, 'seconds');
        } catch (error) {
          logger.error('Error refreshing token:', error);
          // При ошибке помечаем токен как истекший
          token.exp = now - 1;
          return token;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Добавляем информацию о времени истечения для клиента
        session.expires = new Date((token.exp as number) * 1000).toISOString();
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: JWT_SECRET,
};

export const generateToken = (userId: string, isAdmin: boolean) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign(
    { userId, isAdmin },
    secret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  try {
    return jwt.verify(token, secret) as { userId: string; isAdmin: boolean };
  } catch {
    return null;
  }
};
