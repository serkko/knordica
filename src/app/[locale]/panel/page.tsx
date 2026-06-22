import { redirect } from "next/navigation";

export default async function PanelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/panel/inicio`);
}
