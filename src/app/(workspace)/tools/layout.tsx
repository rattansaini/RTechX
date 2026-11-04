import { WorkspaceShell, type ShellAccount } from "@/components/tools/workspace-shell";
import { TOOLS_TRIAL_DAYS } from "@/content/tools";
import { currentAccess } from "@/lib/tools/session";

/**
 * The toolkit as an app: sidebar + top bar, no marketing header or footer.
 * Covers /tools/dashboard and /tools/[slug]. The public showcase at /tools
 * lives in the (site) group and keeps the normal site chrome.
 */
export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const access = await currentAccess();
  const account: ShellAccount =
    access.state === "active"
      ? {
          state: "active",
          email: access.user.email,
          daysLeft: access.daysLeft,
          trialDays: TOOLS_TRIAL_DAYS,
          usedToday: access.usedToday,
          dailyLimit: access.dailyLimit,
        }
      : access.state === "expired"
        ? { state: "expired", email: access.user.email }
        : { state: "signed-out" };

  return <WorkspaceShell account={account}>{children}</WorkspaceShell>;
}
