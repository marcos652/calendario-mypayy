import { getUserProfile } from "@/services/users.service";

export async function getUserNamesByIds(ids: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      const user = await getUserProfile(id);
      result[id] = user?.name || id;
    })
  );
  return result;
}
