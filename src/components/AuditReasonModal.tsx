"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getStatusLabelFromList } from "@/lib/utils";

export default function AuditReasonModal({
  open,
  onClose,
  onConfirm,
  oldStatus,
  newStatus,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  oldStatus: string;
  newStatus: string;
}) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Cambiar estado de <b>{getStatusLabelFromList(oldStatus)}</b> a{" "}
            <b>{getStatusLabelFromList(newStatus)}</b>
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-2">
          Por seguridad, este cambio será auditado. Por favor, ingresá una
          razón.
        </p>
        <Textarea
          placeholder="Ej: El cliente se equivocó al pagar"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="cursor-pointer"
            onClick={() => {
              onConfirm(reason);
              setReason("");
            }}
            disabled={!reason.trim()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
