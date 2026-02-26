import React from 'react'
import { useQuery } from "@tanstack/react-query";
import { orderApi, statsApi } from "../lib/api";
import { DollarSignIcon, ShoppingBagIcon, UsersIcon, PackageIcon } from "lucide-react";
import { capitalizeText, formatDate, getOrderStatusBadge } from "../lib/utils";

function DashboardPage() {

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["DashboardStats"],
    queryFn: statsApi.getDashboard,
  });

  const recentOrders = ordersData?.orders?.slice(0, 5) || [];

  const statsCards = [
    {
      name: "Ganancias",
      value: statsLoading ? "..." : `$${statsData?.totalRevenue || 0} COP`,
      icon: <DollarSignIcon className="size-8" />,
    },
    {
      name: "Pedidos",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" />,
    },
    {
      name: "Clientes",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-8" />,
    },
    {
      name: "Productos",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <PackageIcon className="size-8" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
        {statsCards.map((stat) => (
          <div key={stat.name} className="stat">
            <div className="stat-figure text-primary">{stat.icon}</div>
            <div className="stat-title">{stat.name}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Pedidos Recientes</h2>

          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">No se encontraron pedidos</div>
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
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="font-medium">{order._id.slice(-8).toUpperCase()}</span>
                      </td>

                      <td>
                        <div>
                          <div className="font-medium">{order.shippingAddress.fullName}</div>
                          <div className="text-sm opacity-60">
                            {order.orderItems.length} producto(s)
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm">
                          {order.orderItems[0]?.name}
                          {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} más`}
                        </div>
                      </td>

                      <td>
                        <span className="font-semibold">${order.totalPrice} COP</span>
                      </td>

                      <td>
                        <div className={`badge ${getOrderStatusBadge(order.status)} text-black`}>
                          {{
                            delivered: "Entregado",
                            paid: "Pagado",
                            pending: "Pendiente",
                          }[order.status?.toLowerCase()] || "No Procesado"}
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
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
  )
}

export default DashboardPage