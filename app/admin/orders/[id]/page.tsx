import OrderDetail from "@/components/admin/orders/OrderDetail";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    return (
        <div className="p-8">
            <OrderDetail id={id} />
        </div>
    );
}
