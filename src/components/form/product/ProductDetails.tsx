import { useState, useEffect } from "react";
import type { Order } from "../../../api/orders.api";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import {
  FileText,
  Hash,
  Palette,
  Layers,
  AlertCircle,
  CheckCircle,
  Calendar,
  Image as ImageIcon,
  Box,
  Truck,
} from "lucide-react";
import { Button } from "../../ui/button";
import React from "react";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  order: Order | null;
  onClose: () => void;
  onTrackOrder?: (orderId: string) => void;
};
export default function OrderDetailsDialog({
  order,
  onClose,
  onTrackOrder,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { language } = useLanguage();
  const t = strings[language].products.details;
  const productForm = strings[language].products.form;

  // Use image_3d_urls from DB (via getOrderById API)
  const image3dUrls = (order?.image_3d_urls ?? []).filter((url) => !!url);

  useEffect(() => {
    if (image3dUrls.length > 0) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex(null);
    }
  }, [order]);

  // Handling view 3d model
  const handleView3DModel = async () => {
    if (selectedIndex === null) return;

    const keyToUse = image3dUrls[selectedIndex];
    if (!keyToUse) return;

    try {
      // image3dUrls are already presigned URLs from the backend
      const presignedUrl = keyToUse;
      const viewerBaseUrl = "https://meshviewer.cloud.dexis.com//?";
      const viewerUrl = `${viewerBaseUrl}projectFormat=stl&url=${encodeURIComponent(
        presignedUrl,
      )}`;
      window.open(
        viewerUrl,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes",
      );
    } catch (error) {
      console.error("Failed to open STL", error);
    }
  };

  return (
    <Sheet open={!!order} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[700px] lg:w-[900px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col"
      >
        <SheetHeader
          className="border-b px-6 py-4 bg-brand-header "
          // style={{ backgroundColor: "#d2e9f2bd" }}
        >
          <SheetTitle className="text-black-500 font-bold">
            {t.title}
          </SheetTitle>
        </SheetHeader>
        {order ? (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {/* Header content if any */}
            </h3>

            <div className="space-y-6">
              {/* ORDER INFORMATION */}
              <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" />
                    {t.orderInfo}
                  </h3>
                  {onTrackOrder && order && order.status === "SHIPPED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-brand-500 border-brand-400 hover:bg-brand-50"
                      onClick={() => {
                        onClose();
                        onTrackOrder(order.order_id);
                      }}
                    >
                      <Truck className="w-4 h-4" />
                      {strings[language].products.trackingDetails}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailCard
                    icon={<Hash className="w-4 h-4 text-brand-400" />}
                    label={t.orderId}
                    value={order.order_id}
                  />
                  <DetailCard
                    icon={<Layers className="w-4 h-4 text-brand-400" />}
                    label={t.product}
                    value={order.product_list}
                  />
                  <DetailCard
                    icon={<Layers className="w-4 h-4 text-brand-400" />}
                    label={t.type}
                    value={order.product_type}
                  />
                  <DetailCard
                    icon={<Palette className="w-4 h-4 text-brand-400" />}
                    label={t.shade}
                    value={order.shade}
                  />
                  <DetailCard
                    icon={<Layers className="w-4 h-4 text-brand-400" />}
                    label={t.toothNumbers}
                    value={
                      Array.isArray(order.tooth_numbers)
                        ? order.tooth_numbers.join(", ")
                        : order.tooth_numbers
                    }
                  />
                  <DetailCard
                    icon={<AlertCircle className="w-4 h-4 text-brand-400" />}
                    label={t.priority}
                    value={order.priority}
                  />
                  <DetailCard
                    icon={<CheckCircle className="w-4 h-4 text-brand-400" />}
                    label={t.status}
                    value={order.status}
                  />
                  <DetailCard
                    icon={<Calendar className="w-4 h-4 text-brand-400" />}
                    label={t.orderDate}
                    value={order.order_date?.slice(0, 10) ?? "-"}
                  />
                </div>
              </div>

              {/* DESIGN NOTES */}
              {order.design_notes && (
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-500" />
                    {productForm.designNotes}
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {order.design_notes}
                  </p>
                </div>
              )}

              {/* PRODUCT IMAGE */}
              {order.image && (
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-brand-500" />
                    {t.referenceImage}
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={
                        order.image.startsWith("data:")
                          ? order.image
                          : `data:image/png;base64,${order.image}`
                      }
                      alt={t.referenceImage}
                      className="w-full h-auto object-contain max-h-[250px]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 3D MODEL VIEWER */}
              {image3dUrls.length > 0 && (
                <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Box className="w-5 h-5 text-brand-500" />
                    {strings[language].modelViewer}
                  </h3>
                  {/* Thumbnails / Switcher */}
                  {image3dUrls.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-5">
                      {image3dUrls.map((keyOrUrl: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedIndex(idx)}
                          className={`px-2 py-1 rounded border flex items-center gap-1 bg-white min-w-[60px] transition-all
              ${selectedIndex === idx ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <Layers className="w-3 h-3 text-gray-500" />
                          <span className="text-[10px] font-medium text-gray-600 truncate">
                            {keyOrUrl.split("/").pop()?.split("?")[0] ||
                              `Model ${idx + 1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleView3DModel}
                    className="bg-brand-500 hover:bg-brand-600 text-white mt-2"
                    disabled={selectedIndex === null}
                  >
                    {t.viewModel}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/*  Shabrand Detail Card (same as PatientDetails)  */
function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-900 break-words">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
