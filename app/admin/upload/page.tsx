import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export const revalidate = 0;

const UploadPage = async () => {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (!user) redirect("/admin/login");
  if (user.email !== "admin@glorify.com") redirect("/");

  return <UploadForm />;
};

export default UploadPage;