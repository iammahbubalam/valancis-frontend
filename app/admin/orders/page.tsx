import OrderDataTable from "@/components/admin/orders/OrderDataTable";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <OrderDataTable />
    </div>
  );
}
