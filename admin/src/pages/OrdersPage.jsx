import { orderApi } from "../lib/api";
import { formatDate } from "../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SearchAndFilter from "../components/SearchFilter";
import { useSearchFilter } from "../hooks/useSearchFilter";

const ORDERS_FILTER_GROUPS = [
  {
    key: "status",
    options: [
      { label: "Todos",      value: "__all__" },
      { label: "Pendiente",  value: "pending",   activeClass: "bg-yellow-400 text-white border-yellow-400" },
      { label: "Pagado",     value: "paid",      activeClass: "bg-blue-500 text-white border-blue-500" },
      { label: "Entregado",  value: "delivered", activeClass: "bg-green-500 text-white border-green-500" },
    ],
  },
];

const STATUS_LABELS = { pending: "Pendiente", paid: "Pagado", delivered: "Entregado" };

function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const orders = ordersData?.orders || [];

  const { filtered, query, setQuery, activeFilters, setFilter, clearAll, activeCount } =
    useSearchFilter({
      data: orders,
      searchFields: ["_id", "shippingAddress.fullName", "shippingAddress.city", "orderItems.0.name", "totalPrice", "status"],
      filterGroups: ORDERS_FILTER_GROUPS,
    });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-base-content/70">Gestionar pedidos de clientes</p>
      </div>

      {/* ORDERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <SearchAndFilter
            query={query}
            setQuery={setQuery}
            filterGroups={ORDERS_FILTER_GROUPS}
            activeFilters={activeFilters}
            setFilter={setFilter}
            clearAll={clearAll}
            activeCount={activeCount}
            placeholder=""
            resultCount={filtered.length}
            totalCount={orders.length}
          />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">No se encontraron pedidos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido #</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr key={order._id}>
                        <td>
                          <span className="font-medium">{order._id.slice(-8).toUpperCase()}</span>
                        </td>

                        <td>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm opacity-60">
                            {order.shippingAddress.city}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium">{totalQuantity} productos</div>
                          <div className="text-sm opacity-60">
                            {order.orderItems[0]?.name}
                            {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} más`}
                          </div>
                        </td>

                        <td>
                          <span className="font-semibold">${order.totalPrice} COP</span>
                        </td>

                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => updateStatusMutation.mutate({orderId: order._id, status: e.target.value})}
                            className="select select-sm"
                            disabled={updateStatusMutation.isPending}
                          >
                            {Object.entries(STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default OrdersPage;