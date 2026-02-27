import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import type { Patient } from "../../../types/patientType";
import { MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import MaskedEmail from "../../common/MaskedEmail";
import MaskedPhone from "../../common/MaskedPhone";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  patients: Patient[];
  onView: (patient: Patient) => void; // View Patient Details (Sheet)
  onAddProduct: (patient: Patient) => void; // Create Order (Sheet)
};

export function PatientTable({ patients, onView, onAddProduct }: Props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = strings[language];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #b4b4b4",
        minHeight: "500px",
      }}
    >
      <Table
        className="w-full text-sm"
        style={{
          width: "100%",
          fontSize: "14px",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <TableHeader>
          <TableRow
            style={{
              background: "var(--table-header)",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <TableHead
              style={{
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#374151",
                fontSize: "13px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {t.patients.table.name}
            </TableHead>
            <TableHead
              style={{
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#374151",
                fontSize: "13px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {t.patients.table.email}
            </TableHead>
            <TableHead
              style={{
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#374151",
                fontSize: "13px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {t.patients.table.contact}
            </TableHead>
            <TableHead
              style={{
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 700,
                color: "#374151",
                fontSize: "13px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {t.patients.table.actions}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {patients.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {t.patients.noPatients}
              </TableCell>
            </TableRow>
          )}

          {patients.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="px-4 py-3 border-b border-gray-300">
                {p.firstName} {p.lastName}
              </TableCell>
              <TableCell className="px-4 py-3 border-b border-gray-300">
                <MaskedEmail email={p.email} />
              </TableCell>
              <TableCell className="px-4 py-3 border-b border-gray-300">
                <MaskedPhone phone={p.contact} />
              </TableCell>

              <TableCell className="px-4 py-3 border-b border-gray-300">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4 " />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {/* VIEW PATIENT DETAILS */}
                    <DropdownMenuItem
                      onClick={() => onView(p)}
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                    >
                      {t.patients.viewDetails}
                    </DropdownMenuItem>

                    {/* Create Order */}
                    <DropdownMenuItem
                      onClick={() => onAddProduct(p)}
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                    >
                      {t.patients.createOrder}
                    </DropdownMenuItem>

                    {/* VIEW PRODUCT DETAILS */}
                    <DropdownMenuItem
                      onClick={() => navigate(`/patients/${p.id}/products`)}
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                    >
                      {t.patients.viewProducts}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
