import { z } from "zod";

export const searchFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Please enter an Instagram username.")
    .max(30, "Instagram usernames can't exceed 30 characters.")
    .transform((val) => val.replace(/^@/, ""))
    .refine((val) => /^[a-zA-Z0-9._]+$/.test(val), {
      message: "Usernames may only contain letters, numbers, periods and underscores.",
    }),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
