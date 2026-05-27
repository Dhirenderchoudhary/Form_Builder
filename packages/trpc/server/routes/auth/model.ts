import { z } from "zod";

export const getMeOutputModel = z.object({
  id: z.string().describe("Internal DB user ID"),
  clerkId: z.string().describe("Clerk user ID"),
  fullName: z.string().nullable().describe("Full name of the user"),
  email: z.string().describe("Email address"),
  profileImageUrl: z.string().nullable().describe("Avatar URL"),
  createdAt: z.date().nullable().describe("Account creation timestamp"),
});
