import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../lib/api";
import { formatDate } from "../lib/utils";

function CustomersPage() {
  const queryClient = useQueryClient();
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
                    <th>Direcciones</th>
                    <th>Lista de Deseos</th>
                    <th>Fecha de Registro</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover align-middle">
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
                        <div className="badge badge-ghost">
                          {customer.addresses?.length || 0} Dirección(es)
                        </div>
                      </td>

                      <td>
                        <div className="badge badge-ghost">
                          {customer.wishlist?.length || 0} Producto(s)
                        </div>
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