"use client";

import { useState } from "react";
import { useAdminShippingZones, useUpdateShippingZone, useCreateShippingZone, useDeleteShippingZone } from "@/hooks/useAdminConfig";
import { Button } from "@/components/ui/Button";
import { Plus, Save, Trash2, Truck, Loader2, Edit2, XCircle } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

export default function ShippingSettingsPage() {
    const { data: zones, isLoading } = useAdminShippingZones();
    const updateMutation = useUpdateShippingZone();
    const createMutation = useCreateShippingZone();
    const deleteMutation = useDeleteShippingZone();
    const dialog = useDialog();

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ label: "", cost: 0, isActive: true });
    const [newZone, setNewZone] = useState({ key: "", label: "", cost: 0, isActive: true });

    const startEditing = (zone: any) => {
        setEditingId(zone.id);
        setEditForm({ label: zone.label, cost: zone.cost, isActive: zone.isActive });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await updateMutation.mutateAsync({
                id: editingId,
                label: editForm.label,
                cost: parseFloat(editForm.cost as any),
                isActive: editForm.isActive
            });
            setEditingId(null);
            dialog.toast({ message: "Shipping zone updated", variant: "success" });
        } catch (e) {
            dialog.toast({ message: "Failed to update zone", variant: "danger" });
        }
    };

    const handleCreate = async () => {
        if (!newZone.key || !newZone.label) {
            dialog.toast({ message: "Key and Label are required", variant: "warning" });
            return;
        }
        try {
            await createMutation.mutateAsync({
                ...newZone,
                cost: parseFloat(newZone.cost as any)
            });
            setNewZone({ key: "", label: "", cost: 0, isActive: true });
            dialog.toast({ message: "New zone created", variant: "success" });
        } catch (e) {
            dialog.toast({ message: "Failed to create zone", variant: "danger" });
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await dialog.confirm({
            title: "Delete Zone?",
            message: "Are you sure you want to delete this shipping zone? This might affect orders currently in checkout.",
            variant: "danger"
        });

        if (confirmed) {
            try {
                await deleteMutation.mutateAsync(id);
                dialog.toast({ message: "Zone deleted", variant: "success" });
            } catch (e) {
                dialog.toast({ message: "Failed to delete zone", variant: "danger" });
            }
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="p-6 lg:p-10 space-y-10">
            <div>
                <h1 className="text-3xl font-serif text-primary mb-2">Shipping Settings</h1>
                <p className="text-secondary">Manage your delivery zones and shipping costs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* List of Zones */}
                <div className="lg:col-span-2 space-y-6">
                    {zones?.map((zone) => (
                        <div key={zone.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-grow">
                                    <div className="p-3 bg-primary/5 rounded-lg text-primary">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow">
                                        {editingId === zone.id ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-secondary">Label</label>
                                                    <input
                                                        className="w-full border-b border-primary/20 py-1 font-medium focus:outline-none focus:border-primary"
                                                        value={editForm.label}
                                                        onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] uppercase font-bold text-secondary">Cost (BDT)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border-b border-primary/20 py-1 focus:outline-none focus:border-primary"
                                                        value={editForm.cost}
                                                        onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="font-serif text-lg">{zone.label} {!zone.isActive && <span className="text-xs text-red-500 font-sans ml-2">(Inactive)</span>}</h3>
                                                <p className="text-sm text-secondary">Key: {zone.key} • Cost: ৳{zone.cost}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {editingId === zone.id ? (
                                        <>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                disabled={updateMutation.isPending}
                                                className="h-9 px-4"
                                            >
                                                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                Save
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={cancelEditing}
                                                className="h-9"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => startEditing(zone)}
                                                className="h-9"
                                            >
                                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(zone.id)}
                                                className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50 px-3"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {zones?.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Truck className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                            <p className="text-secondary">No shipping zones configured yet.</p>
                        </div>
                    )}
                </div>

                {/* Add New Zone */}
                <div className="bg-white p-8 rounded-2xl border border-primary/10 shadow-lg h-fit">
                    <h2 className="font-serif text-xl mb-6">Add New Zone</h2>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-secondary">Key (Unique ID)</label>
                            <input
                                className="w-full bg-transparent border-b border-primary/10 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="e.g. sylhet_zone"
                                value={newZone.key}
                                onChange={e => setNewZone({ ...newZone, key: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-secondary">Display Label</label>
                            <input
                                className="w-full bg-transparent border-b border-primary/10 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="e.g. Sylhet Region"
                                value={newZone.label}
                                onChange={e => setNewZone({ ...newZone, label: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-secondary">Cost (BDT)</label>
                            <input
                                type="number"
                                className="w-full bg-transparent border-b border-primary/10 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
                                placeholder="0"
                                value={newZone.cost}
                                onChange={e => setNewZone({ ...newZone, cost: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="w-full mt-4"
                        >
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Add Zone
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
