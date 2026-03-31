import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalItems } = useCart();

  const totalPrice = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace("R$ ", "").replace(".", "").replace(",", "."));
    return sum + price * item.quantity;
  }, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl tracking-wide">Sacola ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-foreground/60 hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-muted-foreground mb-4" />
                  <p className="font-display text-xl text-foreground mb-2">Sacola vazia</p>
                  <p className="font-body text-sm text-muted-foreground">Adicione produtos para continuar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4"
                    >
                      <div className="w-20 h-24 bg-secondary overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base tracking-wide text-foreground truncate">{item.name}</h3>
                        <p className="font-body text-sm text-foreground mt-1">{item.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center border border-border text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-body text-sm w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center border border-border text-foreground/60 hover:text-foreground transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors self-start"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm tracking-wider uppercase text-muted-foreground">Total</span>
                  <span className="font-display text-2xl text-foreground">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase text-center hover:bg-foreground/90 transition-colors"
                >
                  Finalizar Compra
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
