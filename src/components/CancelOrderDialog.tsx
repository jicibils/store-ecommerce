// src/components/CancelOrderDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function CancelOrderDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar pedido</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">
          Por favor, ingresá el motivo de la cancelación:
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ejemplo: No hubo respuesta, stock insuficiente, etc."
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button
            className="cursor-pointer"
            variant="ghost"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            className="cursor-pointer"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirmar cancelación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
