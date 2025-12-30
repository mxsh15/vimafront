import PaymentClient from "./PaymentClient";


export default async function PaymentPage({
    params,
}: {
    params: { transactionId: string };
}) {
    const { transactionId } = await params;
    return <PaymentClient transactionId={transactionId} />;
}
