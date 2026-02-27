import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { App_config } from "../../../tailwind.config";

import StaffOnboardingForm from "../../components/form/staff/StaffOnboardingForm";
import { Button } from "../../components/ui/button";
import type { Staff } from "../../types/staffType";
import { StaffTable } from "../../components/form/staff/StaffTable";
import { StaffDetails } from "../../components/form/staff/StaffDetails";
import { getStaff } from "../../api/staff.api";
import DefaultSkeleton from "../DefaultSkeleton";
import axios from "axios";
import type { ApiErrorResponse } from "../../types/apiError";

import { useLanguage } from "../../language/useLanguage";
import strings from "../../language";
import Pagination from "../../components/common/Pagination";

// Helper to extract error messages
const extractErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};

export default function StaffPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { language } = useLanguage();
  const t = strings[language];

  const [open, setOpen] = useState(Boolean(location.state?.openOnboarding));
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [details, setDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchStaff(currentPage);
  }, [currentPage]);

  async function fetchStaff(page = 1) {
    try {
      setLoading(true);
      setError(null);
      const response = await getStaff(page, limit);

      if (response && response.data) {
        // Type-safe mapping
        const staffWithAddresses: Staff[] = response.data.map((staffMember: Staff) => ({
          ...staffMember,
          address:
            staffMember.addresses && staffMember.addresses.length > 0
              ? staffMember.addresses[0]
              : staffMember.address,
        }));
        setStaff(staffWithAddresses);
        setTotalPages(response.meta?.totalPages || 1);
        setTotal(response.meta?.total || 0);
      } else if (Array.isArray(response)) {
        const staffWithAddresses: Staff[] = response.map((staffMember: Staff) => ({
          ...staffMember,
          address:
            staffMember.addresses && staffMember.addresses.length > 0
              ? staffMember.addresses[0]
              : staffMember.address,
        }));
        setStaff(staffWithAddresses);
        setTotal(response.length);
        setTotalPages(1);
      }
    } catch (err: unknown) {
      console.error("Error fetching staff:", err);
      setError(
        extractErrorMessage(
          err,
          t.staff.form.errors.loadFailed
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (location.state?.openOnboarding) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  function handleCreateStaff(staffMember: Staff) {
    setStaff((prev) => [staffMember, ...prev]);
    setOpen(false);
  }

  function handleViewStaff(staffMember: Staff) {
    setSelectedStaff(staffMember);
    setDetails(true);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-black-500">
          {t.staff.title}
        </h2>

        <Button
          className="h-9 rounded-md px-4 text-sm font-medium text-white hover:bg-brand-button/80 transition-opacity duration-200 bg-brand-button"
          onClick={() => setOpen(true)}
        >
          {t.staff.addStaff}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Table / Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <DefaultSkeleton key={index} />
          ))}
        </div>
      ) : (
        <StaffTable staff={staff} onView={handleViewStaff} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setCurrentPage}
        className="mt-4"
      />

      {/* Staff Details Sheet */}
      <Sheet open={details} onOpenChange={setDetails}>
        <SheetContent
          className="
            w-full
            sm:w-[700px]
            lg:w-[900px]
            sm:max-w-[700px]
            lg:max-w-[750px]
            h-full
            overflow-hidden
            p-0
          "
        >
          <SheetHeader className="border-b px-6 py-4 bg-brand-header">
            <SheetTitle className="text-black-500 font-bold">
              {t.staff.details.title}
            </SheetTitle>
          </SheetHeader>

          <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-6">
            {selectedStaff && <StaffDetails staff={selectedStaff} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* Invite Staff Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="
            w-full
            sm:w-[700px]
            lg:w-[900px]
            sm:max-w-[700px]
            lg:max-w-[750px]
            h-full
            overflow-hidden
            p-0
          "
        >
          <div className="border-b px-6 py-4 bg-brand-header">
            <h2 className="text-lg font-semibold">
              {t.staff.inviteStaff}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t.staff.inviteSubtitle}
            </p>
          </div>

          <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-6">
            <StaffOnboardingForm onCreate={handleCreateStaff} />
          </div>
        </SheetContent>
      </Sheet>
      <div className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()}  {App_config.brandname}  {strings[language].copyright}
      </div>
    </div>
  );
}
