import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";

export default async function AppGroupLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <AppShell userEmail={user?.email}>{children}</AppShell>;
}
