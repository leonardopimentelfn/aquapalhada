import { useMemo } from "react";
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag, Fish } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { absoluteUrl, formatBRL } from "@/lib/api";
import { WHATSAPP_NUMBER, STORE_NAME } from "@/config";

const CartSheet = () => {
  const { items, isOpen, closeCart, setQty, removeItem, clearCart, total, count } = useCart();

  const message = useMemo(() => {
    if (items.length === 0) return "";
    const lines = items.map((i) => `• ${i.qty}x ${i.name} — ${formatBRL(i.price * i.qty)}`);
    return [
      `Olá, ${STORE_NAME}! Quero fazer um pedido:`,
      "",
      ...lines,
      "",
      `Total: ${formatBRL(total)}`,
      "",
      "Meu nome:",
      "Cidade para entrega:",
    ].join("\n");
  }, [items, total]);

  const checkout = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-aqua/10 bg-navy-800 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-aqua/10 px-6 py-5">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="h-5 w-5 text-aqua" /> Seu carrinho
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {count > 0
              ? `${count} ${count === 1 ? "item" : "itens"} selecionados`
              : "Escolha peixes e produtos no catálogo"}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div
            data-testid="cart-empty-state"
            className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-aqua/20 bg-aqua/5">
              <Fish className="h-7 w-7 text-aqua/60" />
            </span>
            <p className="font-playfair text-xl text-white">Seu carrinho está vazio</p>
            <p className="text-sm text-muted-foreground">
              Explore o catálogo e adicione peixes, invertebrados e acessórios. Ao finalizar, seu
              pedido chega direto no WhatsApp da loja.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6" data-lenis-prevent>
              {items.map((i) => (
                <div
                  key={i.id}
                  data-testid={`cart-item-${i.id}`}
                  className="flex gap-4 rounded-xl border border-aqua/10 bg-navy-700/60 p-3"
                >
                  <img
                    src={absoluteUrl(i.image_url)}
                    alt={i.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-white">{i.name}</p>
                      <button
                        data-testid={`cart-item-remove-${i.id}`}
                        onClick={() => removeItem(i.id)}
                        aria-label={`Remover ${i.name}`}
                        className="text-muted-foreground transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBRL(i.price)} · por {i.unit}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-full border border-aqua/20 px-2 py-1">
                        <button
                          data-testid={`cart-item-decrement-${i.id}`}
                          onClick={() => setQty(i.id, i.qty - 1)}
                          aria-label="Diminuir quantidade"
                          className="text-aqua"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span
                          data-testid={`cart-item-qty-${i.id}`}
                          className="min-w-4 text-center text-sm font-bold text-white"
                        >
                          {i.qty}
                        </span>
                        <button
                          data-testid={`cart-item-increment-${i.id}`}
                          onClick={() => setQty(i.id, i.qty + 1)}
                          aria-label="Aumentar quantidade"
                          className="text-aqua"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-aqua">{formatBRL(i.price * i.qty)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-aqua/10 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total do pedido</span>
                <span data-testid="cart-total" className="text-2xl font-black text-white">
                  {formatBRL(total)}
                </span>
              </div>
              <button
                data-testid="cart-checkout-whatsapp"
                onClick={checkout}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-whats px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02] active:scale-95"
              >
                <MessageCircle className="h-4 w-4" /> Finalizar no WhatsApp
              </button>
              <button
                data-testid="cart-clear"
                onClick={clearCart}
                className="mt-3 w-full text-center text-xs text-muted-foreground transition-colors hover:text-red-400"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
