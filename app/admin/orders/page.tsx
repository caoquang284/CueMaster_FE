"use client";

import { useState } from "react";
import { useOrders } from "@/lib/hooks/use-orders";
import { useTables } from "@/lib/hooks/use-tables";
import { useMenu } from "@/lib/hooks/use-menu";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { tablesApi } from "@/lib/api/tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, X, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { PageSkeleton } from "@/components/loaders/page-skeleton";
import { OrderStatus } from "@/lib/types";

export default function OrdersPage() {
  const { orders, isLoading, isError, mutate } = useOrders({});
  const { tables } = useTables();
  const { menuItems } = useMenu();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [orderItems, setOrderItems] = useState<
    Array<{ menuItemId: string; quantity: number }>
  >([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [newItemId, setNewItemId] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const { toast } = useToast();

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load orders</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const handleAddOrderItem = () => {
    setOrderItems([...orderItems, { menuItemId: "", quantity: 1 }]);
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateOrderItem = (
    index: number,
    field: "menuItemId" | "quantity",
    value: string | number
  ) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const menuItem = (menuItems || []).find(m => m.id === item.menuItemId);
      return sum + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedTableId) {
      toast({
        title: "Error",
        description: "Please select a table",
        variant: "destructive",
      });
      return;
    }

    try {
      // Tự động start table nếu đang IDLE
      const selectedTable = tables?.find(t => t.id === selectedTableId);
      if (selectedTable?.status === "IDLE") {
        await tablesApi.start(selectedTableId);
      }

      const newOrder = await ordersApi.create({ tableId: selectedTableId });

      // Thêm items nếu có
      const validItems = orderItems.filter(
        item => item.menuItemId && item.quantity > 0
      );
      for (const item of validItems) {
        await ordersApi.addItem(newOrder.id, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        });
      }

      await mutate();
      toast({ title: "Success", description: "Table started & order created" });
      setIsDialogOpen(false);
      setSelectedTableId("");
      setOrderItems([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCloseOrder = async (id: string) => {
    if (!confirm("Are you sure you want to close this order?")) return;

    try {
      setActioningId(id);
      await ordersApi.close(id);
      await mutate();
      toast({ title: "Success", description: "Order closed" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleAddItemToOrder = async (
    orderId: string,
    menuItemId: string,
    quantity: number
  ) => {
    try {
      await ordersApi.addItem(orderId, { menuItemId, quantity });
      await mutate();
      toast({ title: "Success", description: "Item added to order" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateItemQuantity = async (
    orderId: string,
    itemId: string,
    quantity: number
  ) => {
    if (quantity < 1) return;
    try {
      await ordersApi.updateItem(orderId, itemId, { quantity });
      await mutate();
      setEditingItemId(null);
      toast({ title: "Success", description: "Item quantity updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveItemFromOrder = async (orderId: string, itemId: string) => {
    if (!confirm("Remove this item from order?")) return;
    try {
      await ordersApi.removeItem(orderId, itemId);
      await mutate();
      toast({ title: "Success", description: "Item removed from order" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuickPay = async (order: any) => {
    if (!confirm("Process payment for this order?")) return;

    try {
      setActioningId(order.id);
      console.log(order);
      // End table nếu đang PLAYING
      // if (order.table?.status === "PLAYING") {
      // }
      await tablesApi.end(order.tableId);

      // Tạo payment
      await paymentsApi.create({
        orderId: order.id,
        method: "CASH",
      });

      await mutate();
      toast({
        title: "Success",
        description: "Payment completed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActioningId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const config = {
      OPEN: { variant: "default" as const, label: "Open" },
      PAID: { variant: "secondary" as const, label: "Paid" },
      CANCELLED: { variant: "destructive" as const, label: "Cancelled" },
    };
    return (
      <Badge variant={config[status].variant}>{config[status].label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">
            Orders
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage table orders
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableId">Table</Label>
                <Select
                  value={selectedTableId}
                  onValueChange={setSelectedTableId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    {(tables || [])
                      .filter(
                        t => t.status === "IDLE" || t.status === "PLAYING"
                      )
                      .map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.code} - {table.type} ({table.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddOrderItem}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Select
                        value={item.menuItemId}
                        onValueChange={value =>
                          handleUpdateOrderItem(index, "menuItemId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {(menuItems || [])
                            .filter(m => m.isAvailable)
                            .map(menuItem => (
                              <SelectItem key={menuItem.id} value={menuItem.id}>
                                {menuItem.name} -{" "}
                                {menuItem.price.toLocaleString()}đ
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e =>
                        handleUpdateOrderItem(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-20"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemoveOrderItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {orderItems.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{calculateTotal().toLocaleString()}đ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrder}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">
            All Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders || []).map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.tableCode || order.tableId}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.length || 0} items
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total.toLocaleString()}đ
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewOrderId(order.id)}
                      >
                        View
                      </Button>
                      {order.status === "OPEN" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleQuickPay(order)}
                            disabled={actioningId === order.id}
                          >
                            Quick Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloseOrder(order.id)}
                            disabled={actioningId === order.id}
                          >
                            Close
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!orders || orders.length === 0) && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Details Dialog */}
      <Dialog open={!!viewOrderId} onOpenChange={() => setViewOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewOrderId &&
            (() => {
              const order = orders?.find(o => o.id === viewOrderId);
              if (!order) return null;

              return (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Order ID:</span>
                      <p className="font-mono text-xs mt-1">{order.id}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Table:</span>
                      <p className="mt-1">
                        {order.table?.code || order.tableId}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>
                      <p className="mt-1">{getStatusBadge(order.status)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Created:</span>
                      <p className="mt-1">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Order Items</h3>
                      {order.status === "OPEN" && (
                        <span className="text-sm text-slate-600">
                          Có thể chỉnh sửa
                        </span>
                      )}
                    </div>

                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.menuItemName || "Unknown Item"}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.price.toLocaleString()}đ × {item.quantity}{" "}
                                ={" "}
                                {(item.price * item.quantity).toLocaleString()}đ
                              </p>
                            </div>
                            {order.status === "OPEN" && (
                              <div className="flex items-center gap-2">
                                {editingItemId === item.id ? (
                                  <>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={editingQuantity}
                                      onChange={e =>
                                        setEditingQuantity(
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                      className="w-20"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateItemQuantity(
                                          order.id,
                                          item.id,
                                          editingQuantity
                                        )
                                      }
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingItemId(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingItemId(item.id);
                                        setEditingQuantity(item.quantity);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleRemoveItemFromOrder(
                                          order.id,
                                          item.id
                                        )
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8 text-slate-500">
                        No items in this order
                      </p>
                    )}

                    {order.status === "OPEN" && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-3">Add New Item</h4>
                        <div className="flex gap-2">
                          <Select
                            value={newItemId}
                            onValueChange={setNewItemId}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {(menuItems || [])
                                .filter(m => m.isAvailable)
                                .map(menuItem => (
                                  <SelectItem
                                    key={menuItem.id}
                                    value={menuItem.id}
                                  >
                                    {menuItem.name} -{" "}
                                    {menuItem.price.toLocaleString()}đ
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="1"
                            value={newItemQty}
                            onChange={e =>
                              setNewItemQty(parseInt(e.target.value) || 1)
                            }
                            className="w-20"
                          />
                          <Button
                            onClick={() => {
                              if (newItemId) {
                                handleAddItemToOrder(
                                  order.id,
                                  newItemId,
                                  newItemQty
                                );
                                setNewItemId("");
                                setNewItemQty(1);
                              }
                            }}
                            disabled={!newItemId}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>{order.total.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-500 mb-1">
              {(orders || []).filter(o => o.status === "OPEN").length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Open Orders
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(orders || []).filter(o => o.status === "PAID").length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Paid
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {(orders || [])
                .reduce((sum, o) => sum + o.total, 0)
                .toLocaleString()}
              đ
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Revenue
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
