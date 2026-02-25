import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { couponApi } from "../lib/api";


const emptyForm = {
    code: "",
    discountType: "percentage",
    discountValue: "",
    expiresAt: "",
};

export default function CouponsPage() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["coupons"],
        queryFn: couponApi.getAll,
    });

    const coupons = data?.coupons || [];

    const createMutation = useMutation({
        mutationFn: couponApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            resetForm();
        },
    });

    const updateMutation = useMutation({
        mutationFn: couponApi.update,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] });
            resetForm();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: couponApi.delete,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
    });

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowModal(false);
    };

    const handleEdit = (coupon) => {
        setForm({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            expiresAt: coupon.expiresAt
                ? new Date(coupon.expiresAt).toLocaleDateString("es-CO")
                : "",
        });
        setEditingId(coupon._id);
        setShowModal(true);
    };

    const handleToggleActive = (coupon) => {
        updateMutation.mutate({ id: coupon._id, isActive: !coupon.isActive });
    };

    const handleDelete = (coupon) => {
        if (!window.confirm(`¿Eliminar el cupón "${coupon.code}"?`)) return;
        deleteMutation.mutate(coupon._id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            code: form.code.toUpperCase().trim(),
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            expiresAt: form.expiresAt ? new Date(form.expiresAt + "T23:59:59Z") : null,
        };
        if (editingId) {
            updateMutation.mutate({ id: editingId, ...payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const saveError =
        createMutation.error?.response?.data?.error ||
        updateMutation.error?.response?.data?.error;

    return (
        <div className="space-y-6">

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cupones</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary text-white"
                >
                    + Agregar Cupón
                </button>
            </div>

            {isLoading ? (
                <p className="text-base-content/70 text-sm">Cargando cupones...</p>
            ) : coupons.length === 0 ? (
                <p className="text-base-content/70 text-sm">No hay cupones creados todavía.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr className="text-base-content/70">
                                <th>Código</th>
                                <th>Descuento</th>
                                <th>Vence</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover">
                                    <td className="font-bold">{coupon.code}</td>
                                    <td>
                                        {coupon.discountType === "percentage"
                                            ? `${coupon.discountValue}%`
                                            : `$${coupon.discountValue.toLocaleString("es-CO")} COP`}
                                    </td>
                                    <td className="text-base-content/70">
                                        {coupon.expiresAt
                                            ? new Date(coupon.expiresAt).toLocaleDateString("es-CO", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })
                                            : "Sin vencimiento"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleToggleActive(coupon)}
                                            className={`badge border-none cursor-pointer ${
                                                coupon.isActive
                                                    ? "bg-green-500 text-black"
                                                    : "bg-neutral-700 text-neutral-400"
                                            }`}
                                        >
                                            {coupon.isActive ? "Activo" : "Inactivo"}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <PencilIcon className="size-4" color="white"/>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon)}
                                            >
                                                <Trash2Icon className="size-4" color="red"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-base-200 border border-base-300 rounded-2xl w-full max-w-md mx-4 p-6">

                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">
                                {editingId ? "Editar Cupón" : "Agregar Cupón"}
                            </h2>
                            <button onClick={resetForm} className="text-base-content/50 hover:text-base-content text-xl leading-none">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm text-base-content/70 mb-1">Código</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ej: BIENVENIDO10"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-base-content/70 mb-1">Tipo de descuento</label>
                                <select
                                    value={form.discountType}
                                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                    className="select select-bordered w-full"
                                >
                                    <option value="percentage">Porcentaje (%)</option>
                                    <option value="fixed">Valor fijo (COP)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-base-content/70 mb-1">
                                    {form.discountType === "percentage" ? "Porcentaje (1 - 100)" : "Valor en COP"}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    max={form.discountType === "percentage" ? 100 : undefined}
                                    placeholder={form.discountType === "percentage" ? "ej: 10" : "ej: 5000"}
                                    value={form.discountValue}
                                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-base-content/70 mb-1">
                                    Fecha de expiración <span className="text-base-content/40">(opcional)</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            {saveError && (
                                <p className="text-red-400 text-sm">{saveError}</p>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="btn btn-ghost flex-1 border-gray-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn bg-orange-500 text-white border-none flex-1"
                                >
                                    {isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Agregar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
