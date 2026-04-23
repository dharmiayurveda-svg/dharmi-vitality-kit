import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Check, Download, Eye, FileDown, Lock, MessageSquareText, Package, Plus, RefreshCw, Settings, ShoppingBag, Trash2, Upload, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { generateInvoicePDF } from "@/lib/invoice";
import { formatCurrency, formatCurrencyPlain, getInvoiceStatusLabel, isCompletedOrder, ORDER_ADMIN_STATUSES } from "@/lib/order-utils";
import { getManagedProducts, type ProductRecord } from "@/lib/product-store";
import { sendStatusChangeNotification, sendCancellationNotification } from "@/lib/send-order-email";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin – Dharmi Ayurveda" }] }),
  component: AdminPage,
});

const ADMIN_PASSWORD = "DHARMI";

interface OrderItem { name: string; quantity: number; price: number; image?: string }
interface Order { id: string; userId: string; customerName: string; customerEmail: string; customerPhone: string; customerAddress: string; items: OrderItem[]; total: number; status: string; createdAt: string }
interface UserProfile { id: string; name: string; email: string; phone: string; address: string; city: string; pincode: string; createdAt?: string }
interface ReviewComment { id: string; userId: string; userName: string; userEmail: string; message: string; rating: number; approved: boolean; createdAt: string }

const emptyProduct: ProductRecord = { id: "", name: "", price: 0, originalPrice: 0, description: "", category: "", image: "" };

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders" | "users" | "products" | "reviews" | "results">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProductRecord>>({});
  const [newProduct, setNewProduct] = useState<ProductRecord>(emptyProduct);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [resultsSaved, setResultsSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [approvingCommentId, setApprovingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("dharmi-admin") === "true") setAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem("dharmi-admin", "true");
      return;
    }
    setError("Wrong password");
  };

  const loadData = async () => {
    const [ordersSnap, usersSnap, managedProducts, commentsSnap, resultsSnap] = await Promise.all([
      getDocs(collection(db, "orders")),
      getDocs(collection(db, "users")),
      getManagedProducts(),
      getDocs(collection(db, "results_comments")),
      getDocs(collection(db, "site_settings")),
    ]);

    setOrders(ordersSnap.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Order)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setUsers(usersSnap.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as UserProfile)).sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    setProducts(managedProducts);
    setComments(commentsSnap.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as ReviewComment)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    const resultsDoc = resultsSnap.docs.find((snapshot) => snapshot.id === "results");
    const data = resultsDoc?.data();
    const urls = data?.youtubeUrls || (data?.youtubeUrl ? [data.youtubeUrl] : []);
    setYoutubeUrls(urls);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const deleteOrder = async (id: string) => {
    await deleteDoc(doc(db, "orders", id));
    setOrders((current) => current.filter((order) => order.id !== id));
  };

  const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
    setUsers((current) => current.filter((user) => user.id !== id));
    if (selectedUserId === id) setSelectedUserId(null);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const deleteComment = async (id: string) => {
    await deleteDoc(doc(db, "results_comments", id));
    setComments((current) => current.filter((comment) => comment.id !== id));
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdatingOrderId(id);
    try {
      await updateDoc(doc(db, "orders", id), { status, updatedAt: new Date().toISOString() });
      const updatedOrder = orders.find(o => o.id === id);
      if (updatedOrder && updatedOrder.customerEmail) {
        if (status === "cancelled") {
          await sendCancellationNotification({
            data: {
              orderId: updatedOrder.id,
              customerName: updatedOrder.customerName,
              customerEmail: updatedOrder.customerEmail,
              customerPhone: updatedOrder.customerPhone,
              customerAddress: updatedOrder.customerAddress,
              reason: "Cancelled by Admin"
            }
          });
        } else {
          await sendStatusChangeNotification({
            data: {
              customerEmail: updatedOrder.customerEmail,
              customerName: updatedOrder.customerName,
              customerPhone: updatedOrder.customerPhone,
              customerAddress: updatedOrder.customerAddress,
              orderId: updatedOrder.id,
              status: status
            }
          });
        }
      }
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };


  const toggleCommentApproval = async (comment: ReviewComment, approved: boolean) => {
    setApprovingCommentId(comment.id);
    try {
      await updateDoc(doc(db, "results_comments", comment.id), { approved, updatedAt: new Date().toISOString() });
      setComments((current) => current.map((entry) => (entry.id === comment.id ? { ...entry, approved } : entry)));
    } catch (error) {
      console.error("Failed to update review status:", error);
    } finally {
      setApprovingCommentId(null);
    }
  };

  const startEdit = (product: ProductRecord) => {
    setEditingProduct(product.id);
    setEditData({ ...product });
  };

  const saveProduct = async (id: string) => {
    const payload = { ...editData, updatedAt: new Date().toISOString() };
    await updateDoc(doc(db, "products", id), payload);
    setProducts((current) => current.map((product) => (product.id === id ? ({ ...product, ...payload } as ProductRecord) : product)));
    setEditingProduct(null);
  };

  const addProduct = async () => {
    const id = newProduct.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || `product-${Date.now()}`;
    const payload: ProductRecord = { ...newProduct, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await setDoc(doc(db, "products", id), payload);
    setProducts((current) => [...current, payload].sort((a, b) => a.name.localeCompare(b.name)));
    setNewProduct(emptyProduct);
  };

  const addVideoUrl = () => {
    if (!newYoutubeUrl.trim()) return;
    setYoutubeUrls([...youtubeUrls, newYoutubeUrl.trim()]);
    setNewYoutubeUrl("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isNewProduct: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=44703e31685d651902ca04050f8d5bd7`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("ImgBB upload failed");
      
      const data = await response.json();
      const downloadURL = data.data.url;

      if (isNewProduct) {
        setNewProduct(prev => ({ ...prev, image: downloadURL }));
      } else {
        setEditData(prev => ({ ...prev, image: downloadURL }));
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeVideoUrl = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const saveResultsSettings = async () => {
    await setDoc(doc(db, "site_settings", "results"), { youtubeUrls, updatedAt: new Date().toISOString() }, { merge: true });
    setResultsSaved(true);
    setTimeout(() => setResultsSaved(false), 1800);
  };

  const downloadInvoice = async (order: Order) => {
    await generateInvoicePDF({
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      items: order.items,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      forceCompletedStatus: true,
    });
  };

  const downloadTablePdf = async (kind: "orders" | "users" | "products") => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const pdf = new jsPDF();
    
    // Professional Header
    pdf.setFillColor(6, 78, 59); // Emerald 900
    pdf.rect(0, 0, 210, 30, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text("DHARMI AYURVEDA", 14, 15);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(167, 243, 208); // Emerald 200
    pdf.text(`${kind.toUpperCase()} REPORT - Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 22);

    const headStyles = { 
      fillColor: [6, 78, 59] as [number, number, number], 
      textColor: 255 as number, 
      fontStyle: "bold" as const,
      fontSize: 10,
      cellPadding: 4
    };

    if (kind === "orders") {
      autoTable(pdf, { 
        startY: 35, 
        head: [["Order", "Customer", "Items", "Total", "Status"]], 
        body: orders.map((order) => [
          order.id.slice(0, 8).toUpperCase(), 
          order.customerName, 
          order.items.map((item) => `${item.name} x${item.quantity}`).join(", "), 
          formatCurrencyPlain(order.total), 
          order.status
        ]),
        headStyles,
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 253, 244] }, // Very light emerald
        theme: "striped"
      });
    } else if (kind === "users") {
      autoTable(pdf, { 
        startY: 35, 
        head: [["Name", "Email", "Phone", "City", "Orders"]], 
        body: users.map((user) => [
          user.name || "—", 
          user.email || "—", 
          user.phone || "—", 
          user.city || "—", 
          String(orders.filter((order) => order.userId === user.id).length)
        ]),
        headStyles,
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: "striped"
      });
    } else {
      autoTable(pdf, { 
        startY: 35, 
        head: [["Name", "Price", "Original", "Category"]], 
        body: products.map((product) => [
          product.name, 
          formatCurrencyPlain(product.price), 
          formatCurrencyPlain(product.originalPrice || product.price), 
          product.category
        ]),
        headStyles,
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        theme: "striped"
      });
    }

    // Add footer with page numbers
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(`Page ${i} of ${pageCount}`, 210 / 2, 285, { align: "center" });
    }

    pdf.save(`dharmi-${kind}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) || null, [users, selectedUserId]);
  const selectedUserOrders = useMemo(() => orders.filter((order) => order.userId === selectedUserId), [orders, selectedUserId]);
  const liveOrders = orders.filter((order) => !isCompletedOrder(order.status));
  const completedOrders = orders.filter((order) => isCompletedOrder(order.status));

  if (!authenticated) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-sm mx-auto px-4 text-center">
          <Lock className="h-16 w-16 text-muted-foreground/30 mx-auto" />
          <h1 className="font-heading text-3xl font-bold text-foreground mt-6">Admin Panel</h1>
          <input type="password" placeholder="Enter admin password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} onKeyDown={(event) => event.key === "Enter" && handleLogin()} className="mt-6 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          <Button variant="cta" className="mt-4 w-full" onClick={handleLogin}>Login</Button>
        </div>
      </section>
    );
  }

  const renderOrderTable = (rows: Order[], editable: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-3 py-3 font-medium text-foreground">Order</th>
            <th className="px-3 py-3 font-medium text-foreground">Customer</th>
            <th className="px-3 py-3 font-medium text-foreground">Items</th>
            <th className="px-3 py-3 font-medium text-foreground">Total</th>
            <th className="px-3 py-3 font-medium text-foreground">Status</th>
            <th className="px-3 py-3 font-medium text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id} className="border-t border-border align-top">
              <td className="px-3 py-3 font-medium text-foreground">#{order.id.slice(0, 8).toUpperCase()}<div className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-IN")}</div></td>
              <td className="px-3 py-3"><div className="font-medium text-foreground">{order.customerName}</div><div className="text-xs text-muted-foreground">{order.customerPhone}</div><div className="text-xs text-muted-foreground">{order.customerAddress}</div></td>
              <td className="px-3 py-3 text-xs text-muted-foreground">{order.items.map((item, index) => <div key={index}>{item.name} ×{item.quantity} <span className="text-foreground">{formatCurrency(item.price * item.quantity)}</span></div>)}</td>
              <td className="px-3 py-3 font-semibold text-foreground whitespace-nowrap">{formatCurrency(order.total)}</td>
              <td className="px-3 py-3">
                {editable ? (
                  <div className="flex items-center gap-2">
                    <select 
                      value={order.status} 
                      onChange={(event) => updateOrderStatus(order.id, event.target.value)} 
                      disabled={updatingOrderId === order.id}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
                    >
                      {ORDER_ADMIN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    {updatingOrderId === order.id && <RefreshCw className="h-4 w-4 text-primary animate-spin" />}
                  </div>
                ) : (
                  <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">{order.status}</span>
                )}
              </td>
              <td className="px-3 py-3"><div className="flex items-center gap-2"><button onClick={() => downloadInvoice(order)} className="text-primary hover:text-primary/80 p-1"><FileDown className="h-4 w-4" /></button>{editable ? <button onClick={() => deleteOrder(order.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 className="h-4 w-4" /></button> : null}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="py-8 sm:py-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex gap-1 sm:gap-2 mt-5 border-b border-border pb-2 overflow-x-auto">
          {[{ key: "orders", label: "Orders", icon: Package }, { key: "users", label: "Users", icon: Users }, { key: "products", label: "Products", icon: ShoppingBag }, { key: "reviews", label: "Reviews", icon: MessageSquareText }, { key: "results", label: "Results", icon: Settings }].map((entry) => (
            <button key={entry.key} onClick={() => { setTab(entry.key as never); if (entry.key !== "users") setSelectedUserId(null); }} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === entry.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <entry.icon className="h-4 w-4" /> {entry.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadTablePdf("orders")}><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
                <Button variant="ghost" size="sm" onClick={loadData}>Refresh</Button>
              </div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="border-b border-border px-4 py-3"><h2 className="font-heading text-lg font-semibold text-foreground">Live Orders ({liveOrders.length})</h2></div>{liveOrders.length ? renderOrderTable(liveOrders, true) : <p className="px-4 py-4 text-muted-foreground">No live orders.</p>}</div>
              <div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="border-b border-border px-4 py-3"><h2 className="font-heading text-lg font-semibold text-foreground">Completed Orders ({completedOrders.length})</h2></div>{completedOrders.length ? renderOrderTable(completedOrders, false) : <p className="px-4 py-4 text-muted-foreground">No completed orders yet.</p>}</div>
            </div>
          )}

          {tab === "users" && (
            selectedUser ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(null)}><ArrowLeft className="h-4 w-4 mr-1" /> Back to all users</Button>
                <div className="rounded-2xl bg-card border border-border p-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">{selectedUser.name || "Unnamed user"}</h2>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                    <div><span className="text-foreground font-medium">Email:</span> {selectedUser.email || "—"}</div>
                    <div><span className="text-foreground font-medium">Phone:</span> {selectedUser.phone || "—"}</div>
                    <div className="sm:col-span-2"><span className="text-foreground font-medium">Address:</span> {selectedUser.address || "—"}</div>
                    <div><span className="text-foreground font-medium">City:</span> {selectedUser.city || "—"}</div>
                    <div><span className="text-foreground font-medium">Pincode:</span> {selectedUser.pincode || "—"}</div>
                  </div>
                  <Button variant="destructive" size="sm" className="mt-4" onClick={() => deleteUser(selectedUser.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete User</Button>
                </div>
                <div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="border-b border-border px-4 py-3"><h2 className="font-heading text-lg font-semibold text-foreground">Orders by this user</h2></div>{selectedUserOrders.length ? renderOrderTable(selectedUserOrders, true) : <p className="px-4 py-6 text-muted-foreground">This user hasn’t placed any orders yet.</p>}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => downloadTablePdf("users")}><Download className="h-4 w-4 mr-1" /> Download PDF</Button><Button variant="ghost" size="sm" onClick={loadData}>Refresh</Button></div>
                {users.map((user) => (
                  <div key={user.id} className="rounded-2xl bg-card border border-border p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <button onClick={() => setSelectedUserId(user.id)} className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{user.name || "No name"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email || "—"} • {user.phone || "No phone"}</p>
                      <p className="text-xs text-muted-foreground">{orders.filter((order) => order.userId === user.id).length} order(s)</p>
                    </button>
                    <div className="flex items-center gap-2 self-end sm:self-auto"><Button variant="outline" size="sm" onClick={() => setSelectedUserId(user.id)}><Eye className="h-4 w-4 mr-1" /> View</Button><button onClick={() => deleteUser(user.id)} className="text-destructive hover:text-destructive/80 p-1.5"><Trash2 className="h-4 w-4" /></button></div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => downloadTablePdf("products")}><Download className="h-4 w-4 mr-1" /> Download PDF</Button><Button variant="ghost" size="sm" onClick={loadData}>Refresh</Button></div>
              <div className="rounded-2xl bg-card border border-border p-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">Add Product</h2>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <input value={newProduct.id} onChange={(event) => setNewProduct((current) => ({ ...current, id: event.target.value }))} placeholder="Product slug (e.g. ginger-kit)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <input value={newProduct.name} onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <input type="number" value={newProduct.price || 0} onChange={(event) => setNewProduct((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Price" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <input type="number" value={newProduct.originalPrice || 0} onChange={(event) => setNewProduct((current) => ({ ...current, originalPrice: Number(event.target.value) }))} placeholder="Original price" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <input value={newProduct.category} onChange={(event) => setNewProduct((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <div className="flex gap-2">
                    <input value={newProduct.image} onChange={(event) => setNewProduct((current) => ({ ...current, image: event.target.value }))} placeholder="Image URL" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                    <label className="flex items-center justify-center px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary cursor-pointer hover:bg-primary/10 transition-colors">
                      <Upload className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploadingImage} />
                    </label>
                  </div>
                  <textarea value={newProduct.description} onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Description" className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none" />
                </div>
                <Button className="mt-4" onClick={addProduct} disabled={uploadingImage}>
                  {uploadingImage ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  {uploadingImage ? "Uploading..." : "Add Product"}
                </Button>
              </div>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="rounded-2xl bg-card border border-border p-4">
                    {editingProduct === product.id ? (
                      <div className="space-y-3">
                        <input value={editData.name || ""} onChange={(event) => setEditData((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="number" value={editData.price || 0} onChange={(event) => setEditData((current) => ({ ...current, price: Number(event.target.value) }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                          <input type="number" value={editData.originalPrice || 0} onChange={(event) => setEditData((current) => ({ ...current, originalPrice: Number(event.target.value) }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-2">
                          <input value={editData.image || ""} onChange={(event) => setEditData((current) => ({ ...current, image: event.target.value }))} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                          <label className="flex items-center justify-center px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary cursor-pointer hover:bg-primary/10 transition-colors">
                            <Upload className="h-4 w-4" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} disabled={uploadingImage} />
                          </label>
                        </div>
                        <textarea value={editData.description || ""} onChange={(event) => setEditData((current) => ({ ...current, description: event.target.value }))} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none" />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveProduct(product.id)} disabled={uploadingImage}>
                            {uploadingImage ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingProduct(null)} disabled={uploadingImage}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(product.price)} 
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="ml-2 line-through text-xs opacity-70">{formatCurrency(product.originalPrice)}</span>
                            )}
                            {" • "}{product.category}
                          </p>
                          <p className="text-xs text-muted-foreground break-all">{product.image || "No image URL"}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(product)} className="text-primary hover:text-primary/80 p-1"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => deleteProduct(product.id)} className="text-destructive hover:text-destructive/80 p-1"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-4">{comments.length === 0 ? <p className="text-muted-foreground">No comments yet.</p> : comments.map((comment) => <div key={comment.id} className="rounded-2xl border border-border bg-card p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-foreground">{comment.userName}</p><p className="text-xs text-muted-foreground">{comment.userEmail || "—"} • {new Date(comment.createdAt).toLocaleString("en-IN")}</p><p className="mt-2 text-sm text-muted-foreground">{comment.message}</p><p className="mt-2 text-xs font-medium text-primary">Rating: {comment.rating}/5</p></div><div className="flex flex-wrap gap-2"><Button variant={comment.approved ? "default" : "outline"} size="sm" onClick={() => toggleCommentApproval(comment, !comment.approved)} disabled={approvingCommentId === comment.id}>{approvingCommentId === comment.id ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}{comment.approved ? "Approved" : "Approve"}</Button><Button variant="destructive" size="sm" onClick={() => deleteComment(comment.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button></div></div></div>)}</div>
          )}

          {tab === "results" && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-heading text-lg font-semibold text-foreground">Results Video Settings</h2>
              <p className="mt-2 text-sm text-muted-foreground">Manage the YouTube video links that appear on the Results page.</p>

              <div className="mt-6 space-y-3">
                {youtubeUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input value={url} disabled className="flex-1 rounded-xl border border-border bg-muted/30 px-4 py-2 text-sm" />
                    <Button variant="destructive" size="sm" onClick={() => removeVideoUrl(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <input value={newYoutubeUrl} onChange={(event) => setNewYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground" />
                <Button onClick={addVideoUrl}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>

              <Button className="mt-8 w-full sm:w-auto" onClick={saveResultsSettings}>Save All Video Links</Button>
              {resultsSaved && <p className="mt-3 text-sm font-medium text-primary">Saved successfully.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

