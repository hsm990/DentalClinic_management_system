import { z } from "zod";

export const uploadMetadataSchema = z.object({
  label: z.string().min(1),
});
