import { db } from '../../../utils/db';
import { users, roles } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { createToken } from '../../../utils/auth';
import { getThaIDUser } from '../../../utils/thaid';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = query.code as string;

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Authorization code is required' });
  }

  // 1. Get User from ThaiID
  const thaidUser = await getThaIDUser(code);

  // 2. Find or Create User
  let userList = await db.select({
    id: users.id,
    username: users.username,
    role: roles.name,
    agencyId: users.agencyId
  })
  .from(users)
  .leftJoin(roles, eq(users.roleId, roles.id))
  .where(eq(users.thaiId, thaidUser.pid))
  .limit(1);

  let user = userList[0];

  if (!user) {
    // Create new user with default 'user' role
    const userRole = await db.select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, 'user'))
      .limit(1);

    const result = await db.insert(users).values({
      username: `thaid_${thaidUser.pid}`,
      thaiId: thaidUser.pid,
      fullName: thaidUser.name,
      roleId: userRole[0].id
    });

    user = {
      id: Number(result[0].insertId),
      username: `thaid_${thaidUser.pid}`,
      role: 'user',
      agencyId: null
    };
  }

  // 3. Create Token and Set Cookie
  const token = await createToken({
    id: user.id,
    username: user.username,
    role: user.role,
    agencyId: user.agencyId
  });

  setCookie(event, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/'
  });

  return sendRedirect(event, '/');
});
