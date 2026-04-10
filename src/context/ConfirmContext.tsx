import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type ConfirmDeletionOptions = {
  title?: string;
  confirmLabel?: string;
};

export type ConfirmTone = "garden" | "danger";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  /** garden = mint UI + green CTA; danger = delete / irreversible */
  tone?: ConfirmTone;
};

type Pending = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

const ConfirmContext = createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
} | null>(null);

function ConfirmModal({
  options,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const tone: ConfirmTone = options.tone ?? "garden";

  const modal = (
    <div
      className={`confirm-modal-overlay confirm-modal-overlay--${tone}`}
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={`confirm-modal-content confirm-modal-content--${tone}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h3
          id="confirm-modal-title"
          className={`confirm-modal-title confirm-modal-title--${tone}`}
        >
          {options.title}
        </h3>
        <p className={`confirm-modal-message confirm-modal-message--${tone}`}>
          {options.message}
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className={`confirm-modal-btn-cancel confirm-modal-btn-cancel--${tone}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`confirm-modal-btn-confirm confirm-modal-btn-confirm--${tone}`}
            onClick={onConfirm}
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const finish = useCallback((value: boolean) => {
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    setPending(null);
    p.resolve(value);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const next: Pending = { options, resolve };
      pendingRef.current = next;
      setPending(next);
    });
  }, []);

  const handleCancel = useCallback(() => finish(false), [finish]);
  const handleConfirm = useCallback(() => finish(true), [finish]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {pending ? (
        <ConfirmModal
          options={pending.options}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}

export function useConfirmDeletion() {
  const { confirm } = useConfirm();

  const confirmDeletion = useCallback(
    async (
      actionDescription: string,
      opts?: ConfirmDeletionOptions,
    ): Promise<boolean> => {
      const trimmed = actionDescription.trim();
      const hasUndone = trimmed.toLowerCase().includes("cannot be undone");
      const message = hasUndone
        ? trimmed
        : `${trimmed}\n\nThis cannot be undone.`;
      return confirm({
        title: opts?.title ?? "Are you sure?",
        message,
        confirmLabel: opts?.confirmLabel ?? "Delete",
        tone: "danger",
      });
    },
    [confirm],
  );

  return { confirmDeletion };
}
