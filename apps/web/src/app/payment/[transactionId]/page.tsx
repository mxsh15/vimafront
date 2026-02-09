import PaymentClient from "./PaymentClient";

export async function generateMetadata({
  params,
}: {
  params: { transactionId: string };
}) {
  return { title: `پرداخت ${params.transactionId} | ShopVima` };
}

export default async function PaymentPage({
  params,
}: {
  params: { transactionId: string };
}) {
  const { transactionId } = await params;
  return <PaymentClient transactionId={transactionId} />;
}
