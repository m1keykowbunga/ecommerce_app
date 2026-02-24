import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../lib/api";
import { formatDate } from "../lib/utils";

const DOCUMENT_LABELS = {
  cedula_ciudadania: "C.C.",
  cedula_extranjeria: "C.E."
};

const GENDER_LABELS = {
  masculino: "Masculino",
  femenino: "Femenino",
  otro: "Otro",
};

function formatBirthDate(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("T")[0].split("-");
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function calcAge(iso) {
  if (!iso) return null;
  const [year, month, day] = iso.split("T")[0].split("-");
  const birth = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const m = today.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

function CustomersPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: customerApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error) => {
      console.error("Failed to update customer status:", error);
    },
  });

  const customers = data?.customers || [];

  const handleStatusChange = (customerId, currentIsActive, newValue) => {
    const isActive = newValue === "true";
    if (isActive === currentIsActive) return;
    updateStatus({ customerId, isActive });
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-base-content/70 mt-1">
          {customers.length} {customers.length === 1 ? "cliente" : "clientes"} registrado(s)
        </p>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-error">
              <p className="text-xl font-semibold mb-2">Error al cargar los clientes</p>
              <p className="text-sm">{error?.message ?? "Intente de nuevo más tarde"}</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">No se encontraron clientes registrados</p>
              <p className="text-sm">Los clientes aparecerán aquí una vez que se registren</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo Electrónico</th>
                    <th>Documento</th>
                    <th>Género</th>
                    <th>Fecha de Nacimiento</th>
                    <th>Contacto</th>
                    <th>Fecha de Registro</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <>
                      {/* MAIN ROW */}
                      <tr
                        key={customer._id}
                        className="hover align-middle cursor-pointer"
                        onClick={() => toggleExpand(customer._id)}
                      >
                        <td className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="rounded-full w-12">
                              {customer.imageUrl ? (
                                <img
                                  src={customer.imageUrl}
                                  alt={customer.name}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="bg-primary text-white flex items-center justify-center w-12 h-12 text-xl font-bold">
                                  {customer.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="font-semibold">{customer.name}</div>
                        </td>

                        <td>{customer.email}</td>

                        <td>
                          {customer.documentType ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs text-base-content/60">
                                {DOCUMENT_LABELS[customer.documentType] ?? customer.documentType}
                                {customer.documentNumber || "—"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-base-content/30 text-sm">—</span>
                          )}
                        </td>

                        <td>
                          <span className="text-sm">
                            {customer.gender
                              ? GENDER_LABELS[customer.gender] ?? customer.gender
                              : <span className="text-base-content/30">—</span>
                            }
                          </span>
                        </td>

                        <td>
                          {customer.dateOfBirth ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm">{formatBirthDate(customer.dateOfBirth)}</span>
                              <span className="text-xs text-base-content/40">
                                {calcAge(customer.dateOfBirth)} años
                              </span>
                            </div>
                          ) : (
                            <span className="text-base-content/30 text-sm">—</span>
                          )}
                        </td>

                        <td>
                          {customer.addresses?.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {customer.addresses.map((address) => (
                                <div
                                  key={address._id}
                                  className="px-3 py-2 flex flex-col gap-0.5"
                                >
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-xs">{address.label}</span>
                                  </div>
                                  <p className="text-xs text-base-content/60">{address.streetAddress}</p>
                                  <p className="text-xs text-base-content/60">{address.city}</p>
                                  <p className="text-xs text-base-content/50">{address.phoneNumber}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-base-content/30 text-sm">—</span>
                          )}
                        </td>

                        <td>
                          <span className="text-sm opacity-60">{formatDate(customer.createdAt)}</span>
                        </td>

                        <td>
                          <select
                            className="select select-sm w-36"
                            value={String(customer.isActive !== false)}
                            onChange={(e) =>
                              handleStatusChange(customer._id, customer.isActive !== false, e.target.value)
                            }
                            disabled={isPending}
                          >
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                          </select>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomersPage;
