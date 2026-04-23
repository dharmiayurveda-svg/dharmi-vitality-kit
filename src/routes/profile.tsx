import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { Check, FileDown, LogOut, Package, Save, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { generateInvoicePDF } from "@/lib/invoice";
import { canCancelOrder, formatCurrency, getInvoiceStatusLabel, isCompletedOrder, ORDER_PROCESS_STATUSES } from "@/lib/order-utils";
import { sendCancellationNotification } from "@/lib/send-order-email";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile – Dharmi Ayurveda" },
      { name: "description", content: "Manage your profile and view order history." },
    ],
  }),
  component: ProfilePage,
});

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

function StatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">Order Cancelled</div>;
  }

  const activeIndex = ORDER_PROCESS_STATUSES.indexOf((ORDER_PROCESS_STATUSES.includes(status as never) ? status : "confirmed") as never);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-1">
        {ORDER_PROCESS_STATUSES.map((step, index) => {
          const reached = index <= activeIndex;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {reached ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                <span className={`mt-1 hidden text-[9px] font-medium capitalize sm:block ${reached ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
              </div>
              {index < ORDER_PROCESS_STATUSES.length - 1 && <div className={`h-0.5 flex-1 ${index < activeIndex ? "bg-primary" : "bg-muted"}`} />}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-medium capitalize text-primary sm:hidden">Current: {status}</p>
    </div>
  );
}

function ProfilePage() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({ name: "", email: "", phone: "", address: "", city: "", pincode: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profileSnap = await getDoc(doc(db, "users", user.uid));
      const profileData = profileSnap.exists() ? (profileSnap.data() as Partial<ProfileData>) : {};
      setProfile({
        name: profileData.name || user.displayName || "",
        email: profileData.email || user.email || "",
        phone: profileData.phone || "",
        address: profileData.address || "",
        city: profileData.city || "",
        pincode: profileData.pincode || "",
      });

      const ordersSnap = await getDocs(collection(db, "orders"));
      const userOrders = ordersSnap.docs
        .map((snapshot) => ({ id: snapshot.id, ...(snapshot.data() as Record<string, unknown>) }) as Order & { userId?: string })
        .filter((order) => order.userId === user.uid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(userOrders);
    })();
  }, [user]);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading...</div>;

  if (!user) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-w-md mx-auto px-4 text-center">
          <User className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h1 className="font-heading text-3xl font-bold text-foreground mt-6">Sign In</h1>
          <p className="text-muted-foreground mt-3">Sign in with Google to view your profile and orders.</p>
          <Button variant="cta" size="xl" className="mt-8" onClick={signInWithGoogle}>Sign in with Google</Button>
        </div>
      </section>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await setDoc(doc(db, "users", user.uid), { ...profile, email: user.email || profile.email, updatedAt: new Date().toISOString() }, { merge: true });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "cancelled", updatedAt: new Date().toISOString() });
      const cancelledOrder = orders.find(o => o.id === orderId);
      if (cancelledOrder) {
        await sendCancellationNotification({
          data: {
            orderId: cancelledOrder.id,
            customerName: cancelledOrder.customerName || profile.name || user?.displayName || "Customer",
            customerEmail: user?.email || profile.email || cancelledOrder.customerEmail || "",
            customerPhone: cancelledOrder.customerPhone || profile.phone || "",
            customerAddress: cancelledOrder.customerAddress || `${profile.address}, ${profile.city} - ${profile.pincode}` || ""
          }
        });
      }
      setOrders((current) => current.map((order) => (order.id == orderId ? { ...order, status: "cancelled" } : order)));
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };



  const downloadInvoice = async (order: Order) => {
    await generateInvoicePDF({
      orderId: order.id,
      customerName: order.customerName || profile.name || user.displayName || "",
      customerEmail: order.customerEmail || user.email || "",
      customerPhone: order.customerPhone || profile.phone,
      customerAddress: order.customerAddress || `${profile.address}, ${profile.city} - ${profile.pincode}`,
      items: order.items,
      total: order.total,
      status: getInvoiceStatusLabel(order.status),
      createdAt: order.createdAt,
    });
  };

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold text-foreground">My Profile</h1>
          <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4 mr-1" /> Logout</Button>
        </div>

        <div className="mt-8 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            {user.photoURL && <img src={user.photoURL} alt="User profile" className="h-12 w-12 rounded-full" />}
            <div>
              <p className="font-semibold text-foreground">{user.displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {(["name", "email", "phone", "address", "city", "pincode"] as const).map((field) => (
              <div key={field} className={field === "address" ? "sm:col-span-2" : ""}>
                <label className="text-sm font-medium text-foreground capitalize">{field}</label>
                {field === "address" ? (
                  <textarea value={profile[field]} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} rows={2} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                ) : (
                  <input type="text" value={profile[field]} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                )}
              </div>
            ))}
          </div>
          <Button variant="cta" className="mt-4" onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : saved ? "Saved ✓" : "Save Profile"}</Button>
        </div>

        <div className="mt-8">
          <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> My Orders</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground mt-4">No orders yet. <Link to="/shop" className="text-primary hover:underline">Start shopping!</Link></p>
          ) : (
            <div className="mt-4 space-y-4">
              {orders.map((order) => {
                const completed = isCompletedOrder(order.status);
                const cancellable = canCancelOrder(order.status);
                return (
                  <div key={order.id} className="rounded-2xl bg-card border border-border p-4 sm:p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-foreground text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize whitespace-nowrap">{order.status}</span>
                    </div>

                    <StatusTimeline status={order.status} />

                    <div className="mt-3 text-sm text-muted-foreground">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2 py-0.5">
                          <span className="truncate">{item.name} ×{item.quantity}</span>
                          <span className="whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                      <span className="text-sm font-semibold text-foreground">Total</span>
                      <span className="font-heading text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      {completed ? (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => downloadInvoice(order)}><FileDown className="h-4 w-4 mr-1" /> Download Invoice</Button>
                      ) : (
                        <p className="text-xs text-muted-foreground flex-1">Invoice will be available after the order is delivered.</p>
                      )}
                      {cancellable ? (
                        <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => handleCancelOrder(order.id)}><XCircle className="h-4 w-4 mr-1" /> Cancel Order</Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
