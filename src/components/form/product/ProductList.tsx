import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Badge } from "../../ui/badge";
import { useState, useEffect } from "react";
import OrderDetailsDialog from "../product/ProductDetails";
import AddProductForm from "./AddProductForm";
import TrackingDetails from "./TrackingDetails";
import { type Order } from "../../../api/orders.api";
import { useParams } from "react-router-dom";
import { getOrdersByPatientId, getOrderById } from "../../../api/orders.api";
import DefaultSkeleton from "../../../pages/DefaultSkeleton";
import axios from "axios";
import type { ApiErrorResponse } from "../../../types/apiError";
import { format } from "date-fns";

/* 🌍 LOCALIZATION */
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";
import Pagination from "../../common/Pagination";

/* ---------- Badge Helpers ---------- */
const getPriorityBadge = (priority: string, t: any) => {
  switch (priority) {
    case "HIGH":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          {t.priority.high}
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
          {t.priority.medium}
        </Badge>
      );
    case "LOW":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {t.priority.low}
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {t.status.completed}
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          {t.status.rejected}
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
          {t.status.pending}
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          {t.status.accepted}
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {t.status.shipped}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

/* ---------- Page ---------- */
export default function ProductListPage() {
  const { language } = useLanguage();
  const t = strings[language].products;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingSource, setTrackingSource] = useState<"list" | "viewDetails">(
    "list",
  );
  const [lastViewedOrder, setLastViewedOrder] = useState<Order | null>(null);
  const { patientId } = useParams<{ patientId: string }>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  /* ----- Fetch single order details ----- */
  async function handleViewOrder(orderId: string) {
    try {
      const data = await getOrderById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error("Failed to load order details", err);
    }
  }

  /* ----- Fetch orders for a patient ----- */
  async function fetchOrders(id: string, page = 1) {
    try {
      setLoading(true);
      setError(null);

      const response = await getOrdersByPatientId(id, page, limit);
      if (response && response.data) {
        setOrders(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotal(response.meta?.total || 0);
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotal(response.length);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      let errorMessage = t.noProducts;

      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) errorMessage = message.join(", ");
        else if (typeof message === "string") errorMessage = message;
        else if (err.message) errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchOrders(patientId, currentPage);
    }
  }, [patientId, currentPage]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">{t.title}</h1>

      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #b4b4b4",
          minHeight: "500px",
        }}
      >
        <Table className="w-full text-sm text-left">
          <TableHeader>
            <TableRow
              style={{
                background: "var(--table-header)",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {[
                t.table.serialNo,
                t.table.product,
                t.table.type,
                t.table.priority,
                t.table.status,
                t.table.orderDate,
                t.table.actions,
              ].map((head) => (
                <TableHead
                  key={head}
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    fontSize: "13px",
                    textAlign: "left",
                    color: "#374151",
                  }}
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <DefaultSkeleton key={index} />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-red-600 py-6 text-center"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-gray-500"
                >
                  {t.noProducts}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o, index) => (
                <TableRow key={o.order_id}>
                  <TableCell className="font-medium">
                    {1000 + total - ((currentPage - 1) * limit + index)}{" "}
                  </TableCell>
                  <TableCell>{o.product_list}</TableCell>
                  <TableCell>{o.product_type}</TableCell>
                  <TableCell>{getPriorityBadge(o.priority, t)}</TableCell>
                  <TableCell>{getStatusBadge(o.status, t)}</TableCell>
                  <TableCell>
                    {format(new Date(o.order_date), "MM-dd-yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewOrder(o.order_id)}
                          className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                        >
                          {t.viewDetails}
                        </DropdownMenuItem>

                        { o.status === "SHIPPED"? (
                          <DropdownMenuItem
                            onClick={() => {
                              setTrackingOrderId(o.order_id);
                              setTrackingSource("list");
                              setIsTrackingOpen(true);
                            }}
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                          >
                            {t.trackingDetails}
                          </DropdownMenuItem>
                        ) : null}
                        {o.status === "REJECTED" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                console.log(
                                  "Fetching full details for review, order_id:",
                                  o.order_id,
                                );
                                const fullOrder = await getOrderById(
                                  o.order_id,
                                );
                                console.log(
                                  "Full order received for review:",
                                  fullOrder,
                                );
                                setReviewOrder(fullOrder);
                                setIsReviewOpen(true);
                              } catch (err) {
                                console.error(
                                  "Failed to load full order for review",
                                  err,
                                );
                                // Fallback to list item if fetch fails
                                setReviewOrder(o);
                                setIsReviewOpen(true);
                              }
                            }}
                            className="text-red-500 cursor-pointer hover:text-red-700  focus:text-red-700"
                          >
                            {t.reviewForm}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setCurrentPage}
        className="mt-4"
      />

      {/* RIGHT-SIDE DETAILS (unchanged) */}
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onTrackOrder={(orderId) => {
          const orderToSave = selectedOrder;
          setSelectedOrder(null);
          setLastViewedOrder(orderToSave);
          setTrackingOrderId(orderId);
          setTrackingSource("viewDetails");
          setIsTrackingOpen(true);
        }}
      />

      <Sheet open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[700px] lg:w-[900px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col"
        >
          <SheetHeader
            className="border-b px-6 py-4 bg-brand-header"
            // style={{ backgroundColor: "#d2e9f2bd" }}
          >
            <SheetTitle className="text-black-500 font-bold">
              {t.form.reviewTitle}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {reviewOrder && patientId && (
              <AddProductForm
                patientId={patientId}
                isEdit={true}
                order={reviewOrder}
                onSuccess={() => {
                  setIsReviewOpen(false);
                  setReviewOrder(null);
                  fetchOrders(patientId);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Tracking Details Sheet */}
      {trackingOrderId && (
        <TrackingDetails
          orderId={trackingOrderId}
          open={isTrackingOpen}
          source={trackingSource}
          onClose={() => {
            setIsTrackingOpen(false);
            setTrackingOrderId(null);
          }}
          onBackToDetails={() => {
            // Instantly re-open View Details with stored order (no API call)
            if (lastViewedOrder) {
              setSelectedOrder(lastViewedOrder);
              setLastViewedOrder(null);
            }
          }}
        />
      )}
      <div className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} {strings[language].copyright}
      </div>
    </div>
  );
}
