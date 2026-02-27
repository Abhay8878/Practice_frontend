import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { useState, useEffect } from "react";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";
import {
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Truck,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getTracking } from "../../../api/orders.api";

// Types
interface TrackingLocation {
  city?: string;
  state?: string;
  country?: string;
}

interface TimelineEvent {
  date: string;
  status: string;
  location: string;
  subEvents?: TimelineEvent[];
}

interface TrackingData {
  trackingNumber: string;
  carrier: string;
  serviceType: string;
  currentStatus: {
    status: string;
    description: string;
    location: TrackingLocation;
    lastUpdated: string;
  };
  route: {
    origin: TrackingLocation;
    destination: TrackingLocation;
  };
  pickupDetails?: {
    isHoldAtLocation: boolean;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  package: {
    weight: string;
    dimensions: string;
    count: number;
  };
  timeline: TimelineEvent[];
  isAccepted: boolean;
}

interface TrackingDetailsProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
  source?: "viewDetails" | "list";
  onBackToDetails?: () => void;
}

// ---- City-grouped timeline types ----
interface CityGroup {
  city: string;
  events: TimelineEvent[];
  alwaysShow: boolean;
}

const ALWAYS_SHOW_STATUSES = ["picked up", "ready for recipient pickup"];

function groupTimelineByCity(timeline: TimelineEvent[]): CityGroup[] {
  const groups: CityGroup[] = [];

  for (const event of timeline) {
    const city = event.location || "Unknown";
    const isAlwaysShow = ALWAYS_SHOW_STATUSES.some((s) =>
      event.status.toLowerCase().includes(s),
    );

    if (isAlwaysShow) {
      groups.push({ city, events: [event], alwaysShow: true });
    } else {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && !lastGroup.alwaysShow && lastGroup.city === city) {
        lastGroup.events.push(event);
      } else {
        groups.push({ city, events: [event], alwaysShow: false });
      }
    }
  }

  return groups;
}

const TrackingDetails = ({
  orderId,
  open,
  onClose,
  source = "list",
  onBackToDetails,
}: TrackingDetailsProps) => {
  const { language } = useLanguage();
  const tk = strings[language].products.tracking;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open && orderId) {
      fetchTrackingData();
    }
    if (!open) {
      setTrackingData(null);
      setLoading(true);
      setError(null);
      setExpandedGroups(new Set());
    }
  }, [orderId, open]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTracking(orderId);
      if (result.success && result.data) {
        const data: TrackingData = { ...result.data, isAccepted: true };
        setTrackingData(data);
      } else {
        setError(tk.noTrackingInfo);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to fetch tracking information";
      setError(typeof message === "string" ? message : String(message));
      console.error("Tracking fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Back arrow: instant — if from viewDetails, just set state; no API call
  const handleBack = () => {
    onClose();
    if (source === "viewDetails" && onBackToDetails) {
      // Small delay so the tracking sheet closes first
      // setTimeout(() => onBackToDetails(),);
    }
  };

  // ---------- Date formatting with validation ----------
  const isValidDate = (dateString: string | undefined | null): boolean => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return !isNaN(d.getTime());
  };

  const formatDate = (dateString: string) => {
    if (!isValidDate(dateString)) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString: string) => {
    if (!isValidDate(dateString)) return "";
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // ---------- Status badge color ----------
  const getStatusBadgeColor = (status: string) => {
    const s = status.toLowerCase();
    if (
      s.includes("delivered") ||
      (s.includes("ready") && s.includes("pickup"))
    ) {
      return "bg-green-100 text-green-700 border-green-300";
    } else if (
      s.includes("transit") ||
      s.includes("vehicle") ||
      s.includes("way")
    ) {
      return "bg-blue-100 text-blue-700 border-blue-300";
    } else if (s.includes("picked up")) {
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  // ---------- Icon color logic ----------
  // From: green if picked up or beyond
  // In Transit: grey if only picked up, blue if in transit, green if delivered
  // Destination: grey unless delivered/ready for pickup
  const getIconColors = () => {
    if (!trackingData || !trackingData.isAccepted) {
      return {
        from: "bg-gray-400",
        transit: "bg-gray-400",
        destination: "bg-gray-400",
      };
    }
    const s = trackingData.currentStatus.status.toLowerCase();
    const isPickedUp =
      s.includes("picked up") &&
      !s.includes("transit") &&
      !s.includes("vehicle") &&
      !s.includes("delivered") &&
      !s.includes("ready");
    const isDelivered = s.includes("delivered");
    const isReadyForPickup = s.includes("ready") && s.includes("pickup");

    if (isDelivered) {
      return {
        from: "bg-green-600",
        transit: "bg-green-600",
        destination: "bg-green-600",
      };
    } else if (isReadyForPickup) {
      return {
        from: "bg-green-600",
        transit: "bg-blue-700",
        destination: "bg-gray-400",
      };
    } else if (isPickedUp) {
      return {
        from: "bg-green-600",
        transit: "bg-gray-400",
        destination: "bg-gray-400",
      };
    } else {
      // In transit / on vehicle / etc
      return {
        from: "bg-green-600",
        transit: "bg-blue-500",
        destination: "bg-gray-400",
      };
    }
  };

  const getLineColors = () => {
    if (!trackingData || !trackingData.isAccepted) {
      return { line1: "bg-gray-300", line2: "bg-gray-300" };
    }
    const s = trackingData.currentStatus.status.toLowerCase();
    const isPickedUp =
      s.includes("picked up") &&
      !s.includes("transit") &&
      !s.includes("vehicle") &&
      !s.includes("delivered") &&
      !s.includes("ready");
    const isDelivered = s.includes("delivered");
    const isReadyForPickup = s.includes("ready") && s.includes("pickup");

    if (isDelivered) {
      return { line1: "bg-green-500", line2: "bg-green-500" };
    } else if (isReadyForPickup) {
      return { line1: "bg-green-500", line2: "bg-gray-300" };
    } else if (isPickedUp) {
      return { line1: "bg-gray-300", line2: "bg-gray-300" };
    } else {
      return { line1: "bg-green-500", line2: "bg-gray-300" };
    }
  };

  const getTextColors = () => {
    if (!trackingData || !trackingData.isAccepted) {
      return {
        from: "text-gray-500",
        transit: "text-gray-500",
        destination: "text-gray-500",
      };
    }
    const s = trackingData.currentStatus.status.toLowerCase();
    const isPickedUp =
      s.includes("picked up") &&
      !s.includes("transit") &&
      !s.includes("vehicle") &&
      !s.includes("delivered") &&
      !s.includes("ready");
    const isDelivered = s.includes("delivered");
    const isReadyForPickup = s.includes("ready") && s.includes("pickup");

    if (isDelivered) {
      return {
        from: "text-green-600",
        transit: "text-green-600",
        destination: "text-green-600",
      };
    } else if (isReadyForPickup) {
      return {
        from: "text-green-600",
        transit: "text-green-600",
        destination: "text-gray-500",
      };
    } else if (isPickedUp) {
      return {
        from: "text-green-600",
        transit: "text-gray-500",
        destination: "text-gray-500",
      };
    } else {
      return {
        from: "text-green-600",
        transit: "text-blue-600",
        destination: "text-gray-500",
      };
    }
  };

  const toggleGroupExpanded = (index: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // ---------- Render states ----------
  if (loading) {
    return (
      <Sheet open={open} onOpenChange={handleBack}>
        <SheetContent
          side="right"
          className="w-full sm:w-[600px] lg:w-[750px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col"
        >
          <SheetHeader className="border-b px-6 py-4 bg-brand-header">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <SheetTitle className="font-bold">
                {strings[language].products.trackingDetails}
              </SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">{tk.loadingTracking}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error || !trackingData) {
    return (
      <Sheet open={open} onOpenChange={handleBack}>
        <SheetContent
          side="right"
          className="w-full sm:w-[600px] lg:w-[750px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col overflow-hidden"
        >
          <SheetHeader className="border-b px-6 py-4 bg-brand-header">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <SheetTitle className="font-bold">{strings[language].products.trackingDetails}</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{tk.noTrackingInfo}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!trackingData.isAccepted) {
    return (
      <Sheet open={open} onOpenChange={handleBack}>
        <SheetContent
          side="right"
          className="w-full sm:w-[600px] lg:w-[750px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col"
        >
          <SheetHeader className="border-b px-6 py-4 bg-brand-header">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <SheetTitle className="font-bold">{strings[language].products.trackingDetails}</SheetTitle>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progress Timeline Header - Not Accepted */}
            <div className="mb-8">
              <div className="relative flex items-start justify-between mb-6">
                <div className="relative flex flex-col items-center w-1/3 z-10">
                  <div className="w-[70px] h-[70px] rounded-full bg-gray-400 flex items-center justify-center mb-3">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div
                    className="absolute top-[35px] left-[calc(50%+35px)] w-[calc(50vw-185px)] h-0.5 bg-gray-300"
                    style={{ maxWidth: "200px" }}
                  />
                  <p className="text-sm font-semibold text-center text-gray-500">
                    {tk.from}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {trackingData.route.origin.city},{" "}
                    {trackingData.route.origin.state}{" "}
                    {trackingData.route.origin.country}
                  </p>
                </div>
                <div className="relative flex flex-col items-center w-1/3 z-10">
                  <div className="w-[70px] h-[70px] rounded-full bg-gray-400 flex items-center justify-center mb-3">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <div
                    className="absolute top-[35px] left-[calc(50%+35px)] w-[calc(50vw-185px)] h-0.5 bg-gray-300"
                    style={{ maxWidth: "200px" }}
                  />
                  <p className="text-sm font-semibold text-center text-gray-500">
                    {tk.status}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {tk.pending}
                  </p>
                </div>
                <div className="relative flex flex-col items-center w-1/3 z-10">
                  <div className="w-[70px] h-[70px] rounded-full bg-gray-400 flex items-center justify-center mb-3">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-center text-gray-500">
                    {tk.destination}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {trackingData.route.destination.city},{" "}
                    {trackingData.route.destination.state}{" "}
                    {trackingData.route.destination.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {tk.orderPendingTitle}
                </h3>
                <p className="text-gray-600 mb-4">
                  {tk.orderPendingDescription}
                </p>
                <p className="text-sm text-gray-500">
                  {tk.orderId}: <span className="font-medium">{orderId}</span>
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const iconColors = getIconColors();
  const lineColors = getLineColors();
  const textColors = getTextColors();
  const cityGroups = groupTimelineByCity(trackingData.timeline);

  return (
    <Sheet open={open} onOpenChange={handleBack}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] lg:w-[750px] sm:max-w-[700px] lg:max-w-[750px] h-full p-0 flex flex-col"
      >
        <SheetHeader className="border-b px-6 py-4 bg-brand-header">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <SheetTitle className="font-bold">
              {tk.trackingId}: {trackingData.trackingNumber}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Timeline Header */}
          <div className="mb-8">
            <div className="relative flex items-start justify-between mb-6">
              {/* Connecting line 1: From → In Transit (behind icons, between circles) */}
              <div
                className={`absolute top-[35px] h-0.5 transition-all duration-500 ${lineColors.line1}`}
                style={{
                  left: "calc(16.67% + 35px)",
                  right: "calc(83.33% - 16.67% + 35px)",
                  width: "calc(33.33% - 70px)",
                }}
              />
              {/* Connecting line 2: In Transit → Destination */}
              <div
                className={`absolute top-[35px] h-0.5 transition-all duration-500 ${lineColors.line2}`}
                style={{
                  left: "calc(50% + 35px)",
                  width: "calc(33.33% - 70px)",
                }}
              />

              {/* From */}
              <div className="relative flex flex-col items-center w-1/3 z-10">
                <div
                  className={`w-[70px] h-[70px] rounded-full ${iconColors.from} flex items-center justify-center mb-3`}
                >
                  <Package className="h-8 w-8 text-white" />
                </div>
                <p
                  className={`text-sm font-semibold text-center ${textColors.from}`}
                >
                  {tk.from}
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  {trackingData.route.origin.city},{" "}
                  {trackingData.route.origin.state}{" "}
                  {trackingData.route.origin.country}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {trackingData.timeline.length > 0 &&
                    isValidDate(
                      trackingData.timeline[trackingData.timeline.length - 1]
                        .date,
                    ) &&
                    `${formatDate(trackingData.timeline[trackingData.timeline.length - 1].date)} ${formatTime(trackingData.timeline[trackingData.timeline.length - 1].date)}`}
                </p>
              </div>

              {/* In Transit */}
              <div className="relative flex flex-col items-center w-1/3 z-10">
                <div
                  className={`w-[70px] h-[70px] rounded-full flex items-center justify-center mb-3 ${iconColors.transit}`}
                >
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <p
                  className={`text-sm font-semibold text-center ${textColors.transit}`}
                >
                  {tk.inTransit}
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  {trackingData.currentStatus.location.city},{" "}
                  {trackingData.currentStatus.location.state}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {isValidDate(trackingData.currentStatus.lastUpdated)
                    ? `${formatDate(trackingData.currentStatus.lastUpdated)} ${formatTime(trackingData.currentStatus.lastUpdated)}`
                    : `${formatDate(new Date().toISOString())} ${formatTime(new Date().toISOString())}`}
                </p>
              </div>

              {/* Destination */}
              <div className="relative flex flex-col items-center w-1/3 z-10">
                <div
                  className={`w-[70px] h-[70px] rounded-full flex items-center justify-center mb-3 ${iconColors.destination}`}
                >
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <p
                  className={`text-sm font-semibold text-center ${textColors.destination}`}
                >
                  {tk.destination}
                </p>
                <p className="text-xs text-gray-600 text-center mt-1">
                  {trackingData.route.destination.city},{" "}
                  {trackingData.route.destination.state}{" "}
                  {trackingData.route.destination.country}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {trackingData.timeline.length > 0 &&
                    isValidDate(trackingData.timeline[0].date) &&
                    formatDate(trackingData.timeline[0].date)}
                </p>
              </div>
            </div>
          </div>

          {/* Last Updated + Current Status */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-600">
              {tk.lastUpdatedOn}:{" "}
              {isValidDate(trackingData.currentStatus.lastUpdated)
                ? formatDate(trackingData.currentStatus.lastUpdated)
                : formatDate(new Date().toISOString())}
            </p>
            <p
              className={`px-3 py-1 rounded-full text-sm font-semibold border whitespace-nowrap ${getStatusBadgeColor(
                trackingData.currentStatus.status,
              )}`}
            >
              {tk.currentStatus}: {trackingData.currentStatus.status}
            </p>
          </div>

          {/* Timeline - No scroller, proper alignment */}
          <div className="bg-white rounded-lg border border-gray-200">
            {cityGroups.map((group, groupIndex) => {
              const isLastGroup = groupIndex === cityGroups.length - 1;
              const isCollapsible =
                !group.alwaysShow && group.events.length > 1;
              const isExpanded = expandedGroups.has(groupIndex);
              const primaryEvent = group.events[0];
              const collapsedEvents = group.events.slice(1);

              return (
                <div
                  key={groupIndex}
                  className="relative border-b border-gray-200 last:border-b-0"
                >
                  {/* Continuous vertical line — goes from this row to the next, stops at last group */}
                  {!isLastGroup && (
                    <div
                      className="absolute w-0.5 bg-black z-0"
                      style={{
                        left: "calc(1rem + 12rem + 1rem - 1px)",
                        top: "22px",
                        bottom: "-22px",
                      }}
                    />
                  )}

                  {/* PRIMARY EVENT ROW */}
                  <div className="flex items-start p-4">
                    {/* DATE + TIME */}
                    <div className="w-48 flex-shrink-0">
                      <p className="text-sm font-medium leading-tight">
                        {formatDate(primaryEvent.date)}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {formatTime(primaryEvent.date)}
                      </p>
                    </div>

                    {/* TIMELINE DOT */}
                    <div className="relative w-8 flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-black z-10" />
                    </div>

                    {/* STATUS + LOCATION + ARROW */}
                    <div className="flex-1 min-w-0 pl-3 flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate flex-1">
                        {primaryEvent.status}
                      </p>
                      {primaryEvent.location && (
                        <p className="text-sm text-gray-600 whitespace-nowrap">
                          {primaryEvent.location}
                        </p>
                      )}
                      <div className="w-6 flex-shrink-0 flex justify-center">
                        {isCollapsible && (
                          <button
                            onClick={() => toggleGroupExpanded(groupIndex)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COLLAPSED EVENTS — shown when expanded */}
                  {isCollapsible && isExpanded && (
                    <div className="bg-gray-50">
                      {collapsedEvents.map((event, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex items-start px-4 py-3 border-t border-gray-100"
                        >
                          {/* DATE + TIME */}
                          <div className="w-48 flex-shrink-0">
                            <p className="text-xs text-gray-500 leading-tight">
                              {formatDate(event.date)}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatTime(event.date)}
                            </p>
                          </div>

                          {/* SMALL DOT */}
                          <div className="relative w-8 flex flex-col items-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-gray-400 z-10 mt-0.5" />
                          </div>

                          {/* SUB CONTENT */}
                          <div className="flex-1 min-w-0 pl-3 flex items-center gap-2">
                            <p className="text-sm text-gray-700 truncate flex-1">
                              {event.status}
                            </p>
                            {event.location && (
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                {event.location}
                              </p>
                            )}
                            <div className="w-6 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TrackingDetails;
