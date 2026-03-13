import { requireCompletedProfile } from "@/lib/auth-guards";
import { LivePoseTrainer } from "@/components/live-pose-trainer";

export default async function TrainerPage() {
  await requireCompletedProfile();

  return <LivePoseTrainer />;
}
