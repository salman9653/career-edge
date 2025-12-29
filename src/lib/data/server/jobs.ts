import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { unstable_cache } from "next/cache";
import type { Job } from "@/lib/types";

export const getJobsServer = unstable_cache(
  async () => {
    try {
      const jobsQuery = adminDb.collection("jobs");
      const jobsSnap = await jobsQuery.get();

      return jobsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          // Transform other timestamps if needed
        } as unknown as Job;
      });
    } catch (error) {
      console.error("Error fetching jobs (server):", error);
      return [];
    }
  },
  ["all-jobs-server"],
  { revalidate: 60, tags: ["jobs"] }
);
