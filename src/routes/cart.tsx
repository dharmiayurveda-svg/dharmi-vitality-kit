import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { ArrowRight, MapPin, Minus, Plus, Shield, ShoppingBag, Trash2, User, Phone, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { sendOrderEmail } from "@/lib/send-order-email";
import kitProduct from "@/assets/kit-product.jpg";

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

const STORAGE_KEY = "dharmi-customer-details";

function loadCustomerDetails(): CustomerDetails {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    return { name: "", phone: "", address: "", city: "", pincode: "" };
  }
  return { name: "", phone: "", address: "", city: "", pincode: "" };
}

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart – Dharmi Ayurveda" },
      { name: "description", content: "Review your cart and place your order." },
    ],
  }),
  component: CartPage,
});

function ProductImage({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-2 text-center">
        <ImageOff className="h-5 w-5 text-muted-foreground/50" />
        <span className="mt-1 text-[10px] text-muted-foreground">No image</span>
      </div>
    );
  }

  return <img src={src} alt={name} className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />;
}

type PendingOrder = {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ name: string; quantity: number; price: number; image: string }>;
};

function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetails>(loadCustomerDetails);
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [unlockingAdmin, setUnlockingAdmin] = useState(false);
  const [secretLock, setSecretLock] = useState(false);
  const tapsRef = useRef<{ count: number; first: number }>({ count: 0, first: 0 });

  const handleSecretTap = () => {
    if (secretLock) return;
    const now = Date.now();
    if (now - tapsRef.current.first > 1500) {
      tapsRef.current = { count: 1, first: now };
      return;
    }
    tapsRef.current.count += 1;
    if (tapsRef.current.count >= 5) {
      tapsRef.current = { count: 0, first: 0 };
      setSecretLock(true);
      setUnlockingAdmin(true);
      window.setTimeout(() => navigate({ to: "/admin" }), 650);
      window.setTimeout(() => {
        setUnlockingAdmin(false);
        setSecretLock(false);
      }, 2600);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
  }, [customer]);

  const updateField = (field: keyof CustomerDetails, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<CustomerDetails> = {};
    if (!customer.name.trim()) nextErrors.name = "Name is required";
    if (!customer.phone.trim() || customer.phone.length < 10) nextErrors.phone = "Valid phone required";
    if (!customer.address.trim()) nextErrors.address = "Address is required";
    if (!customer.city.trim()) nextErrors.city = "City is required";
    if (!customer.pincode.trim() || customer.pincode.length < 5) nextErrors.pincode = "Valid pincode required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validate()) return;
    if (!user) {
      await signInWithGoogle();
      return;
    }

    setOrdering(true);
    try {
      const orderItems = items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.id === "complete-weight-loss-kit" ? kitProduct : item.product.image || "",
      }));

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: customer.name,
          email: user.email || "",
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          pincode: customer.pincode,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const fullAddress = `${customer.address}, ${customer.city} - ${customer.pincode}`;
      const orderData = {
        userId: user.uid,
        customerName: customer.name,
        customerEmail: user.email || "",
        customerPhone: customer.phone,
        customerAddress: fullAddress,
        items: orderItems,
        total: totalPrice,
        paymentMethod: "COD",
        paymentStatus: "pending",
        status: "confirmed",
        emailStatus: "pending",
        createdAt: new Date().toISOString(),
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);

      const emailResult = await sendOrderEmail({
        data: {
          customerName: customer.name,
          customerEmail: user.email || "",
          customerPhone: customer.phone,
          customerAddress: fullAddress,
          items: orderItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
          total: totalPrice,
          orderId: orderRef.id,
        },
      });

      await updateDoc(doc(db, "orders", orderRef.id), {
        emailStatus: emailResult?.success ? "sent" : "failed",
        emailError: emailResult?.success ? "" : (emailResult as any)?.error || "Email failed",
      });

      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error("Order failed:", error);
      alert("Could not place order. Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  if (orderSuccess) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Order Placed!</h1>
          <p className="text-muted-foreground mt-3">Thank you. Your order is confirmed and we've notified the team.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button variant="cta" size="xl" asChild><Link to="/shop">Continue Shopping</Link></Button>
            <Button variant="outline" size="lg" asChild><Link to="/profile">View Orders</Link></Button>
          </div>
        </div>
      </section>
    );
  }



  if (items.length === 0) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto" />
          <h1 className="font-heading text-3xl font-bold text-foreground mt-6 cursor-pointer select-none" onClick={handleSecretTap}>Your Cart is Empty</h1>
          <p className="text-muted-foreground mt-3">Add some products to get started!</p>
          {unlockingAdmin && <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><Shield className="h-4 w-4 animate-bounce" /> Opening admin…</p>}
          <Button variant="cta" size="xl" asChild className="mt-8"><Link to="/shop">Browse Products</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground cursor-pointer select-none" onClick={handleSecretTap}>Your Cart</h1>
            <p className="text-muted-foreground text-sm mt-1">{items.length} item(s)</p>
          </div>
          {unlockingAdmin && <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><Shield className="h-4 w-4 animate-bounce" /> Opening admin…</div>}
        </div>

        <div className="mt-6 space-y-3">
          {items.map(({ product, quantity }) => {
            const imgSrc = product.id === "complete-weight-loss-kit" ? kitProduct : product.image || "";
            return (
              <div key={product.id} className="flex gap-3 p-3 sm:p-4 rounded-2xl bg-card border border-border">
                <div className="h-16 w-16 sm:h-24 sm:w-24 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <ProductImage name={product.name} src={imgSrc} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <div className="mt-auto pt-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="font-semibold text-sm text-foreground w-5 text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"><Plus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => removeFromCart(product.id)} className="ml-1 text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <span className="font-heading font-bold text-sm sm:text-base text-foreground whitespace-nowrap">₹{(product.price * quantity).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl bg-card border border-border p-4 sm:p-6">
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Delivery Details</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Saved for faster checkout.</p>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <input type="text" value={customer.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone *</label>
              <input type="tel" value={customer.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address *</label>
              <textarea value={customer.address} onChange={(e) => updateField("address", e.target.value)} rows={2} className={inputClass + " resize-none"} />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">City *</label>
              <input type="text" value={customer.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Pincode *</label>
              <input type="text" value={customer.pincode} onChange={(e) => updateField("pincode", e.target.value)} className={inputClass} />
              {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode}</p>}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 rounded-2xl bg-card border border-border p-4 sm:p-6">
          <div className="flex justify-between items-center text-base sm:text-lg font-semibold text-foreground">
            <span>Total</span>
            <span className="font-heading text-xl sm:text-2xl">₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Cash on Delivery • Free shipping • Free diet plan • Lifetime support</p>
          <Button variant="cta" size="xl" className="w-full mt-5 text-sm sm:text-base" onClick={handleProceedToPayment} disabled={ordering}>
            <ArrowRight className="h-5 w-5" />
            <span className="truncate">{ordering ? "Placing order…" : user ? "Place Order (COD)" : "Sign in & Place Order"}</span>
          </Button>
          {!user && <p className="text-xs text-muted-foreground text-center mt-2">You'll be asked to sign in with Google to place your order.</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3">
            <Button variant="outline" size="lg" className="flex-1" asChild><Link to="/shop">Continue Shopping</Link></Button>
            <Button variant="ghost" size="lg" onClick={clearCart}>Clear Cart</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
