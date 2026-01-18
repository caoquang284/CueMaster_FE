"use client";

import { useState, useEffect } from "react";
import { useTables } from "@/lib/hooks/use-tables";
import { useOrders } from "@/lib/hooks/use-orders";
import { useMenu } from "@/lib/hooks/use-menu";
import { tablesApi } from "@/lib/api/tables";
import { ordersApi } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TableType, TableStatus } from "@/lib/types";
import { Search, Plus, Play, Square, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSkeleton } from "@/components/loaders/page-skeleton";
import { useToast } from "@/hooks/use-toast";

export default function TablesPage() {
  const { tables, isLoading, isError, mutate } = useTables();
  const { orders, mutate: mutateOrders } = useOrders({});
  const { menuItems } = useMenu();
  const [filterType, setFilterType] = useState<TableType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTableForOrder, setSelectedTableForOrder] = useState<any>(null);
  const [quickOrderItem, setQuickOrderItem] = useState("");
  const [quickOrderQty, setQuickOrderQty] = useState(1);
  const { toast } = useToast();

  // Cập nhật thời gian mỗi phút để hiển thị thời gian đã chơi real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cập nhật mỗi phút

    return () => clearInterval(interval);
  }, []);

  // Tính toán thời gian đã chơi từ updatedAt
  const calculatePlayedTime = (updatedAt: string): string => {
    const startTime = new Date(updatedAt);
    const now = currentTime;
    const diffMs = now.getTime() - startTime.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const [formData, setFormData] = useState({
    code: "",
    type: "POOL" as TableType,
    priceHour: "",
  });

  if (isLoading) return <PageSkeleton />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Failed to load tables</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredTables = (tables || []).filter(table => {
    const matchesType = filterType === "all" || table.type === filterType;
    const matchesSearch = table.code
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const statusColors: Record<TableStatus, string> = {
    IDLE: "bg-emerald-500",
    PLAYING: "bg-orange-500",
    RESERVED: "bg-blue-500",
  };

  const statusLabels: Record<TableStatus, string> = {
    IDLE: "Available",
    PLAYING: "Playing",
    RESERVED: "Reserved",
  };

  const handleCreateTable = async () => {
    if (!formData.code || !formData.priceHour) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await tablesApi.create({
        code: formData.code,
        type: formData.type,
        priceHour: parseInt(formData.priceHour),
      });
      await mutate();
      toast({ title: "Success", description: "Table created successfully" });
      setIsCreateDialogOpen(false);
      setFormData({ code: "", type: "POOL", priceHour: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: TableStatus) => {
    try {
      setUpdating(id);
      await tablesApi.updateStatus(id, { status });
      await mutate();
      toast({ title: "Success", description: "Table status updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleStartTable = async (id: string) => {
    try {
      setUpdating(id);
      await tablesApi.start(id);
      await mutate();
      toast({ title: "Success", description: "Table started" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleEndTable = async (id: string) => {
    try {
      setUpdating(id);
      await tablesApi.end(id);
      await mutate();
      toast({ title: "Success", description: "Table ended" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleAddQuickOrderItem = async () => {
    if (!selectedTableForOrder || !quickOrderItem) {
      toast({
        title: "Error",
        description: "Please select an item",
        variant: "destructive",
      });
      return;
    }

    const tableOrder = (orders || []).find(
      o => o.tableId === selectedTableForOrder.id && o.status === "OPEN"
    );

    if (!tableOrder) {
      toast({
        title: "Error",
        description: "No active order found for this table",
        variant: "destructive",
      });
      return;
    }

    try {
      await ordersApi.addItem(tableOrder.id, {
        menuItemId: quickOrderItem,
        quantity: quickOrderQty,
      });
      await mutateOrders();
      toast({
        title: "Success",
        description: "Item added to order",
      });
      setQuickOrderItem("");
      setQuickOrderQty(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 dark:text-white">
          Tables
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage billiard tables and their status
        </p>
      </div>

      <Card className="dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">
              All Tables
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Table Code</Label>
                      <Input
                        id="code"
                        placeholder="e.g., T01"
                        value={formData.code}
                        onChange={e =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: TableType) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POOL">Pool</SelectItem>
                          <SelectItem value="SNOOKER">Snooker</SelectItem>
                          <SelectItem value="CAROM">Carom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceHour">Price per Hour (VND)</Label>
                      <Input
                        id="priceHour"
                        type="number"
                        placeholder="50000"
                        value={formData.priceHour}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            priceHour: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTable}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={value => setFilterType(value as any)}
              >
                <SelectTrigger className="w-full sm:w-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="POOL">Pool</SelectItem>
                  <SelectItem value="SNOOKER">Snooker</SelectItem>
                  <SelectItem value="CAROM">Carom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {filteredTables.map(table => (
              <div
                key={table.id}
                className={cn(
                  "flex h-full flex-col rounded-lg border-2 p-5 transition-all duration-300 hover:shadow-lg",
                  table.status === "IDLE" &&
                    "border-emerald-500/30 bg-emerald-500/5",
                  table.status === "PLAYING" &&
                    "border-orange-500/30 bg-orange-500/5",
                  table.status === "RESERVED" &&
                    "border-blue-500/30 bg-blue-500/5"
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                      {table.code}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {table.type}
                    </p>
                  </div>
                  <Badge
                    variant={
                      table.status === "IDLE"
                        ? "default"
                        : table.status === "PLAYING"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {statusLabels[table.status]}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">
                    {table.priceHour.toLocaleString()}đ
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    per hour
                  </div>
                </div>

                {table.status === "PLAYING" && (
                  <div className="mb-3 space-y-1">
                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      Đã chơi: {calculatePlayedTime(table.updatedAt)}
                    </div>
                    {table.startedAt && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Bắt đầu:{" "}
                        {new Date(table.startedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  {table.status === "IDLE" && (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleStartTable(table.id)}
                      disabled={updating === table.id}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {updating === table.id ? "Starting..." : "Start"}
                    </Button>
                  )}
                  {table.status === "PLAYING" && (
                    <>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => setSelectedTableForOrder(table)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order
                      </Button>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleEndTable(table.id)}
                        disabled={updating === table.id}
                      >
                        <Square className="h-4 w-4 mr-2" />
                        {updating === table.id ? "Ending..." : "End"}
                      </Button>
                    </>
                  )}
                  <Select
                    value={table.status}
                    onValueChange={value =>
                      handleUpdateStatus(table.id, value as TableStatus)
                    }
                    disabled={updating === table.id}
                  >
                    <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
                      <SelectItem value="IDLE">Idle</SelectItem>
                      <SelectItem value="PLAYING">Playing</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              No tables found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-500 mb-1">
              {(tables || []).filter(t => t.status === "IDLE").length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Available
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {(tables || []).filter(t => t.status === "PLAYING").length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Playing
            </div>
          </CardContent>
        </Card>
        <Card className="dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {(tables || []).filter(t => t.status === "RESERVED").length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Reserved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Order Dialog */}
      <Dialog
        open={!!selectedTableForOrder}
        onOpenChange={() => {
          setSelectedTableForOrder(null);
          setQuickOrderItem("");
          setQuickOrderQty(1);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Quick Order - Table {selectedTableForOrder?.code}
            </DialogTitle>
          </DialogHeader>
          {selectedTableForOrder && (() => {
            const tableOrder = (orders || []).find(
              o => o.tableId === selectedTableForOrder.id && o.status === "OPEN"
            );

            return (
              <div className="space-y-4 py-4">
                {/* Order Info */}
                {tableOrder ? (
                  <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Current Order</h3>
                      <Badge>Order #{tableOrder.id.slice(0, 8)}</Badge>
                    </div>
                    
                    {/* Current Items */}
                    {tableOrder.items && tableOrder.items.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        <Label className="text-xs text-slate-500">Items:</Label>
                        {tableOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center text-sm p-2 bg-white dark:bg-slate-900 rounded"
                          >
                            <span>{item.menuItemName || "Item"}</span>
                            <span className="font-medium">
                              {item.quantity}x × {item.price.toLocaleString()}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mb-4">No items yet</p>
                    )}

                    {/* Total */}
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-semibold">Order Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {tableOrder.total.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ No active order found for this table. Please create an order first.
                    </p>
                  </div>
                )}

                {/* Add Item Form */}
                {tableOrder && (
                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add New Item
                    </h3>
                    <div className="flex gap-2">
                      <Select
                        value={quickOrderItem}
                        onValueChange={setQuickOrderItem}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(menuItems || [])
                            .filter(m => m.isAvailable)
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - {item.price.toLocaleString()}đ
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={quickOrderQty}
                        onChange={e =>
                          setQuickOrderQty(parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                      />
                      <Button
                        onClick={handleAddQuickOrderItem}
                        disabled={!quickOrderItem}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {/* Table Info */}
                <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="font-semibold mb-2">Table Info</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">Type:</Label>
                      <p className="font-medium">{selectedTableForOrder.type}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Rate:</Label>
                      <p className="font-medium">
                        {selectedTableForOrder.priceHour.toLocaleString()}đ/h
                      </p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-slate-500">Playing time:</Label>
                      <p className="font-medium text-orange-600">
                        {calculatePlayedTime(selectedTableForOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTableForOrder(null);
                setQuickOrderItem("");
                setQuickOrderQty(1);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
