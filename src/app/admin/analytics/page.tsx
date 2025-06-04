"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, isSameMonth } from "date-fns";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ProductSalesReport from "./ProductSalesReport";
import PaymentMethodReport from "./PaymentMethodReport";
import WeekdayOrdersReport from "./WeekdayOrdersReport";
import CancellationRateReport from "./CancellationRateReport";
import RevenueSplitReport from "./RevenueSplitReport";

export interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
}

function getDailyTotals(orders: Order[]) {
  const grouped: Record<string, number> = {};

  for (const order of orders) {
    const date = format(parseISO(order.created_at), "dd/MM");
    grouped[date] = (grouped[date] || 0) + order.total;
  }

  return Object.entries(grouped).map(([date, total]) => ({ date, total }));
}

export default function AnalyticsPage() {
  const now = new Date();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(now.getMonth().toString()); // 0-11
  const [year, setYear] = useState(now.getFullYear().toString()); // "2025"

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status, payment_method");

      if (!error && data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const date = parseISO(o.created_at);
    return isSameMonth(date, new Date(Number(year), Number(month)));
  });

  const total = filtered.reduce((acc, o) => acc + o.total, 0);
  const avg = filtered.length > 0 ? total / filtered.length : 0;

  const exportCSV = () => {
    const rows = [
      ["ID", "Fecha", "Total", "Estado"],
      ...filtered.map((o) => [
        o.id,
        format(parseISO(o.created_at), "yyyy-MM-dd HH:mm"),
        o.total.toFixed(2),
        o.status,
      ]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `reporte-${year}-${Number(month) + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Reportes</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={month} onValueChange={(v) => setMonth(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }).map((_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {new Date(0, i).toLocaleString("es", { month: "long" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-32"
        />

        <Button onClick={exportCSV} variant="outline" className="ml-auto gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <Tabs defaultValue="mensual">
        <TabsList className="mb-4">
          <TabsTrigger value="mensual">📅 Reporte mensual</TabsTrigger>
          <TabsTrigger value="productos">🥇 Productos más vendidos</TabsTrigger>
          <TabsTrigger value="pagos">💳 Métodos de pago</TabsTrigger>
          <TabsTrigger value="dias">📆 Días más activos</TabsTrigger>
          <TabsTrigger value="cancelaciones">❗️ Cancelaciones</TabsTrigger>
          <TabsTrigger value="split">💸 Dividendos</TabsTrigger>
        </TabsList>

        <TabsContent value="mensual">
          {loading ? (
            <p className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              Cargando datos...
            </p>
          ) : (
            <div className="space-y-4">
              <div className="border p-4 rounded bg-muted">
                <p className="text-lg font-semibold">
                  Pedidos: {filtered.length}
                </p>
                <p className="text-lg font-semibold">
                  Ingresos: ${total.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Promedio por pedido: ${avg.toFixed(2)}
                </p>
              </div>

              <div className="bg-background border rounded p-4">
                <h2 className="text-lg font-semibold mb-2">
                  Ingresos diarios 💰
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={getDailyTotals(filtered)}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="productos">
          <ProductSalesReport orders={filtered} />
        </TabsContent>

        <TabsContent value="pagos">
          <PaymentMethodReport orders={filtered} />
        </TabsContent>

        <TabsContent value="dias">
          <WeekdayOrdersReport orders={filtered} />
        </TabsContent>

        <TabsContent value="cancelaciones">
          <CancellationRateReport orders={filtered} />
        </TabsContent>

        <TabsContent value="split">
          <RevenueSplitReport orders={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
