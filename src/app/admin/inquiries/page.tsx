// src/app/admin/inquiries/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Inquirie {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  seen: boolean;
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquirie[]>([]);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const fetchInquiries = async () => {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) toast.error("Error cargando consultas");
      else setInquiries(data);
    };
    fetchInquiries();
  }, [page]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Consultas recibidas
      </h1>
      {inquiries.length === 0 ? (
        <p className="text-center">No hay consultas aún.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {inquiries.map((inquirie) => (
              <li
                key={inquirie.id}
                className="border rounded p-4 shadow relative"
              >
                <p className="text-sm text-muted-foreground mb-1">
                  {new Date(inquirie.created_at).toLocaleString()}
                </p>
                <p className="font-bold">{inquirie.name}</p>
                <p className="text-sm text-muted-foreground">
                  {inquirie.email}
                </p>
                <p className="mt-2 whitespace-pre-wrap">{inquirie.message}</p>

                <button
                  className={`absolute top-2 right-2 text-xs px-2 py-1 rounded cursor-pointer ${
                    inquirie.seen
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                  onClick={async () => {
                    const { error } = await supabase
                      .from("inquiries")
                      .update({ seen: !inquirie.seen })
                      .eq("id", inquirie.id);

                    if (!error) {
                      setInquiries((prev) =>
                        prev.map((item) =>
                          item.id === inquirie.id
                            ? { ...item, seen: !item.seen }
                            : item
                        )
                      );
                    }
                  }}
                >
                  {inquirie.seen ? "Vista" : "Marcar vista"}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Anterior
            </button>
            <span>Página {page}</span>
            <button
              disabled={inquiries.length < perPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
