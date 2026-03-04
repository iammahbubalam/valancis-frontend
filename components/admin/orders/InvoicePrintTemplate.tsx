import { format } from "date-fns";
import Image from "next/image";

interface InvoicePrintTemplateProps {
    order: any;
    config: any;
}

export function InvoicePrintTemplate({ order, config }: InvoicePrintTemplateProps) {
    if (!order) return null;

    const companyName = config?.siteName || "Valancis";
    const supportEmail = config?.supportEmail || "support@valancis.com";

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        @page { size: auto; margin: 0mm !important; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
                    }
                `
            }} />
            <div className="hidden print:block bg-white text-black w-full max-w-4xl mx-auto px-10 py-8 font-sans antialiased">

                {/* Header / Brand */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                    <div>
                        <img
                            src="/assets/valancis-logo.svg"
                            alt={companyName}
                            className="h-8 w-auto mb-3"
                        />
                        <div className="text-[10px] text-gray-500 space-y-0.5 tracking-wide">
                            <p className="uppercase tracking-widest text-gray-400 font-medium mb-2">Fine Fashion & Accessories</p>
                            <p>www.valancis.com</p>
                            <p>{supportEmail}</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <h2 className="text-2xl tracking-widest text-gray-300 font-light uppercase mb-1">Invoice</h2>
                        <div className="flex flex-col items-end gap-1">
                            <span className="font-mono text-gray-600 font-medium text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                                {format(new Date(order.createdAt), "MMMM d, yyyy")}
                            </span>
                            {order.isPreorder && (
                                <span className="mt-2 px-2 py-0.5 border border-orange-200 text-orange-600 text-[10px] font-medium uppercase tracking-wider bg-orange-50">
                                    Pre-Order
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Addresses Grid */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    {/* Billing / Customer Info */}
                    <div>
                        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
                        <div className="space-y-1">
                            <p className="font-medium text-sm text-gray-900">
                                {order.user?.firstName || order.shippingAddress?.firstName || 'Guest'} {order.user?.lastName || order.shippingAddress?.lastName || ''}
                            </p>
                            <p className="text-xs text-gray-500">{order.user?.email || order.shippingAddress?.email}</p>
                            {(order.user?.phone || order.shippingAddress?.phone) && (
                                <p className="text-xs text-gray-500 pt-1">{order.user?.phone || order.shippingAddress?.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div>
                        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-3">Shipped To</h3>
                        <div className="space-y-1">
                            {order.shippingAddress?.address ? (
                                <>
                                    <p className="text-sm font-medium text-gray-900">{order.shippingAddress.address}</p>
                                    <p className="text-xs text-gray-500">
                                        {[order.shippingAddress?.thana, order.shippingAddress?.district].filter(Boolean).join(', ')}
                                        {order.shippingAddress?.zip && ` - ${order.shippingAddress.zip}`}
                                    </p>
                                    {order.shippingAddress?.division && <p className="text-xs text-gray-500 capitalize pt-1">{order.shippingAddress.division.toLowerCase()} Division</p>}
                                    {order.shippingAddress?.deliveryLocation && (
                                        <p className="text-[10px] text-gray-400 mt-1 capitalize tracking-widest uppercase">
                                            Zone: {order.shippingAddress.deliveryLocation.replace(/_/g, ' ').toLowerCase()}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-gray-400 italic">No shipping details provided</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Itemized Table */}
                <div className="mb-8 border-t border-gray-200 pt-4">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="py-2 px-2 font-medium text-[10px] tracking-wider uppercase text-gray-400 w-3/5">Item Description</th>
                                <th className="py-2 px-2 font-medium text-[10px] tracking-wider uppercase text-gray-400 text-center w-1/5">Qty</th>
                                <th className="py-2 px-2 font-medium text-[10px] tracking-wider uppercase text-gray-400 w-1/5 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items?.map((item: any, idx: number) => (
                                <tr key={item.id || idx}>
                                    <td className="py-4 px-2 align-top">
                                        <p className="font-medium text-gray-900 text-sm">{item.product?.name || 'Unknown Item'}</p>
                                        {(item.variantName || item.variantSku) && (
                                            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                                                {item.variantName && <span className="capitalize">{item.variantName}</span>}
                                                {item.variantName && item.variantSku && <span>•</span>}
                                                {item.variantSku && <span className="text-gray-400">SKU: {item.variantSku}</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-4 px-2 text-center align-top">
                                        <p className="text-sm text-gray-700">{item.quantity} <span className="text-[10px] text-gray-400 ml-1">(× ৳{item.price?.toLocaleString()})</span></p>
                                    </td>
                                    <td className="py-4 px-2 text-right align-top">
                                        <p className="text-sm font-medium text-gray-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Breakdown */}
                <div className="flex justify-end mb-12">
                    <div className="w-1/2 md:w-1/3">
                        <div className="space-y-2 border-t border-gray-200 pt-4">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">৳{(order.totalAmount - order.shippingFee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 pb-2">
                                <span>Shipping</span>
                                <span className="font-medium text-gray-900">৳{order.shippingFee?.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-900 pt-3 border-t border-gray-200 font-semibold">
                                <span>Total</span>
                                <span>৳{order.totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Summary Footer */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1 w-1/2">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                            <p className="text-xs font-medium text-gray-800 capitalize">{order.paymentMethod?.replace('_', ' ').toLowerCase()}</p>
                        </div>
                        <div className="text-right space-y-1 w-1/2">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                            <p className="text-xs font-medium mb-1 capitalize">
                                <span className={order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}>
                                    {order.paymentStatus?.replace('_', ' ').toLowerCase()}
                                </span>
                            </p>
                            <p className="text-xs text-gray-600 pt-1">Paid: <span className="text-gray-900 font-medium ml-2">৳{order.paidAmount?.toLocaleString() || 0}</span></p>
                            {order.refundedAmount > 0 && (
                                <p className="text-xs text-red-500">Refunded: <span className="font-medium ml-2">৳{order.refundedAmount?.toLocaleString()}</span></p>
                            )}
                            {Math.max(0, order.totalAmount - order.paidAmount) > 0 && (
                                <div className="pt-2 mt-2 border-t border-gray-100 flex justify-end">
                                    <p className="text-xs text-gray-900 font-medium uppercase tracking-wider">
                                        Due Amount: <span className="text-red-600 ml-3">৳{Math.max(0, order.totalAmount - order.paidAmount).toLocaleString()}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Final Regards */}
                <div className="mt-4 mb-2 text-center">
                    <p className="text-[10px] text-gray-300 uppercase tracking-widest">Thank you for shopping with Valancis.</p>
                </div>

            </div>
        </>
    );
}
