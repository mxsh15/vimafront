import OrderClient from "./OrderClient";

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <OrderClient id={id} />;
}