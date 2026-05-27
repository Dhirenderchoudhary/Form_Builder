import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import type { InsertUser, SelectUser } from "@repo/database/models/user";

class UserService {
  async upsertUser(data: InsertUser): Promise<SelectUser> {
    const [user] = await db
      .insert(usersTable)
      .values(data)
      .onConflictDoUpdate({
        target: usersTable.clerkId,
        set: {
          fullName: data.fullName,
          email: data.email,
          profileImageUrl: data.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!user) throw new Error("Failed to upsert user");
    return user;
  }

  async getUserByClerkId(clerkId: string): Promise<SelectUser | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId));
    return user;
  }

  async getUserById(id: string): Promise<SelectUser | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user;
  }

  async deleteUserByClerkId(clerkId: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.clerkId, clerkId));
  }
}

export default UserService;
