import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "../components/ui/sheet";

import { Button } from "../components/ui/button";
import type { Patient } from "../types/patientType";
import { PatientTable } from "../components/form/patient/PatientTable";
import { PatientDetails } from "../components/form/patient/PatientDetails";
import PatientOnboardingForm from "../components/form/patient/PatientOnboardingForm";
import AddProductForm from "../components/form/product/AddProductForm";
import { getPatients } from "../api/patients.api";
import DefaultSkeleton from "./DefaultSkeleton";
import { useLanguage } from "../language/useLanguage";
import strings from "../language";
import Pagination from "../components/common/Pagination";
import { App_config } from "../../tailwind.config";

/* ✅ SAME WIDTH AS ORIGINAL PATIENT ONBOARDING */
const RIGHT_SHEET_CLASS = `
  w-full
  sm:w-[700px]
  lg:w-[900px]
  sm:max-w-[700px]
  lg:max-w-[700px]
  h-full
  overflow-hidden
  p-0
`;

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [openAddPatient, setOpenAddPatient] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [productPatient, setProductPatient] = useState<Patient | null>(null);

  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const t = strings[language];

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage]);

  async function fetchPatients(page = 1) {
    try {
      setLoading(true);
      const response = await getPatients(page, limit);

      // If server returns paginated data (data and total)
      if (response && response.data) {
        setPatients(
          response.data.map((p: Patient) => ({
            ...p,
            dob: p.dob ? new Date(p.dob) : null,
            address: p.addresses?.[0],
          }))
        );
        setTotalPages(response.meta?.totalPages || 1);
        setTotal(response.meta?.total || 0);
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated (though we updated the api)
        setPatients(
          response.map((p: Patient) => ({
            ...p,
            dob: p.dob ? new Date(p.dob) : null,
            address: p.addresses?.[0],
          }))
        );
        setTotal(response.length);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCreatePatient(patient: Patient) {
    setPatients((prev) => [patient, ...prev]);
    setOpenAddPatient(false);
  }

  function handleViewPatient(patient: Patient) {
    setSelectedPatient(patient);
    setOpenDetails(true);
  }

  function handleAddProduct(patient: Patient) {
    setProductPatient(patient);
    setOpenAddProduct(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t.patients.title}</h2>
        <Button
          className="h-9 rounded-md  px-4 text-sm font-medium text-white hover:bg-brand-button/80 transition-opacity duration-200 bg-brand-button"
          // style={{backgroundColor:"var(--brand-button)"}}
          onClick={() => setOpenAddPatient(true)}
        >
          {t.patients.addPatient}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <DefaultSkeleton key={index} />
          ))}
        </div>
      ) : (
        <PatientTable
          patients={patients}
          onView={handleViewPatient}
          onAddProduct={handleAddProduct}
        />
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

      {/* ---------- PATIENT DETAILS ---------- */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent side="right" className={RIGHT_SHEET_CLASS}>
          <div
            className="border-b px-6 py-4 bg-brand-header"
          //  style={{backgroundColor:"#d2e9f2bd"}}
          >
            <h2 className="font-semibold">{t.patients.viewDetails}</h2>
          </div>
          <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
            {selectedPatient && <PatientDetails patient={selectedPatient} />}
          </div>
        </SheetContent>
      </Sheet>

      {/* ---------- ADD PATIENT ---------- */}
      <Sheet open={openAddPatient} onOpenChange={setOpenAddPatient}>
        <SheetContent side="right" className={RIGHT_SHEET_CLASS}>
          <div
            className="border-b px-6 py-4 bg-brand-header"
          // style={{ backgroundColor: "#d2e9f2bd" }}
          >
            <h2 className="font-semibold">{t.patients.form.addPatientButton}</h2>
            <p className="text-sm text-muted-foreground">
              {t.patients.form.subtitle}
            </p>
          </div>
          <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
            <PatientOnboardingForm onCreate={handleCreatePatient} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ---------- Create Order ---------- */}
      <Sheet open={openAddProduct} onOpenChange={setOpenAddProduct}>
        <SheetContent side="right" className={RIGHT_SHEET_CLASS}>
          <div
            className="border-b px-6 py-4 bg-brand-header"
          // style={{ backgroundColor: "#d2e9f2bd" }}
          >
            <h2 className="font-semibold">{t.patients.createOrder}</h2>
            <p className="text-sm text-muted-foreground">
              {t.patients.paraBelowOrder}
            </p>
          </div>
          <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
            {productPatient && (
              <AddProductForm
                patientId={productPatient.id}
                onSuccess={() => setOpenAddProduct(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      <div className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()}  {App_config.brandname}  {strings[language].copyright}
      </div>
    </div>
  );
}
