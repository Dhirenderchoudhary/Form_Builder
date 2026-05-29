import { db, eq } from "@repo/database";
import { usersTable, apiKeysTable } from "@repo/database/models/user";
import type { InsertUser, SelectUser } from "@repo/database/models/user";
import { createHash } from "node:crypto";

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

  async validateApiKey(apiKey: string): Promise<SelectUser | undefined> {
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    
    const [keyRecord] = await db
      .select()
      .from(apiKeysTable)
      .where(eq(apiKeysTable.keyHash, keyHash));
      
    if (!keyRecord) return undefined;
    
    // Update last used asynchronously
    db.update(apiKeysTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeysTable.id, keyRecord.id))
      .catch(() => void 0);
      
    return this.getUserById(keyRecord.userId);
  }
}

export default UserService;
