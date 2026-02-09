import OrderClient from "./OrderClient";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `سفارش ${params.id} | ShopVima` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderClient id={id} />;
}
