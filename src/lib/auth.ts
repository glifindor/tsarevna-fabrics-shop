import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, isAdmin: boolean) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  
  return jwt.sign(
    { userId, isAdmin },
    secret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  
  try {
    return jwt.verify(token, secret) as { userId: string; isAdmin: boolean };
  } catch (error) {
    return null;
  }
};
