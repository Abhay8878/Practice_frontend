import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { type Staff, PractitionerType } from "../../../types/staffType";
import { MoreVertical } from "lucide-react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import MaskedEmail from "../../common/MaskedEmail";
import MaskedPhone from "../../common/MaskedPhone";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  staff: Staff[];
  onView: (staff: Staff) => void;
};

export function StaffTable({ staff, onView }: Props) {
  const { language } = useLanguage();
  const t = strings[language];
  const tableText = t.staff.table;
  const detailsText = t.staff.details;
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
              {tableText.name}
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
              {tableText.email}
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
              {tableText.phone}
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
              {detailsText.country}
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
              {tableText.role}
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
              {tableText.actions}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {staff.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No staff added yet
              </TableCell>
            </TableRow>
          )}

          {staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="border-b border-gray-200">
                {s.firstName} {s.lastName}
              </TableCell>

              <TableCell className="border-b border-gray-200">
                <MaskedEmail email={s.email} />
              </TableCell>

              <TableCell className="border-b border-gray-200">
                <MaskedPhone phone={s.phoneNumber} />
              </TableCell>

              <TableCell className="border-b border-gray-200">
                {s.address?.country ||
                  (s.addresses && s.addresses[0]?.country) ||
                  "-"}
              </TableCell>

              <TableCell className="border-b border-gray-200 capitalize">
                {s.practitionerType === PractitionerType.ADMIN ||
                  s.practitionerType === PractitionerType.PRACTICE
                  ? "Admin"
                  : "Staff Member"}
              </TableCell>

              <TableCell className="border-b border-gray-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onView(s)}
                      className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                    >
                      {strings[language].products.viewDetails}
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
