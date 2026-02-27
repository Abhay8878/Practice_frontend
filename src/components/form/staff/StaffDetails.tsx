import { type Staff, PractitionerType } from "../../../types/staffType";
import { User, Mail, Phone, Briefcase, MapPin, Home, Flag } from "lucide-react";
import MaskedEmail from "../../common/MaskedEmail";
import MaskedPhone from "../../common/MaskedPhone";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  staff: Staff;
};

export function StaffDetails({ staff }: Props) {
  const { language } = useLanguage();
  const t = strings[language];
  const detailsText = t.staff.details;

  const address = staff.address || (staff.addresses && staff.addresses[0]);

  const roleKey =
    staff.practitionerType === PractitionerType.ADMIN ||
      staff.practitionerType === PractitionerType.PRACTICE
      ? "admin"
      : "staffMember";

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          {detailsText.personalInfo}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailCard
            icon={<User className="w-4 h-4 text-brand-400" />}
            label={detailsText.fullName}
            value={`${staff.firstName} ${staff.middleName ? staff.middleName + " " : ""
              }${staff.lastName}`}
          />

          <DetailCard
            icon={<Mail className="w-4 h-4 text-brand-400" />}
            label={detailsText.email}
            value={<MaskedEmail email={staff.email} />}
          />

          <DetailCard
            icon={<Phone className="w-4 h-4 text-brand-400" />}
            label={detailsText.phoneNumber}
            value={<MaskedPhone phone={staff.phoneNumber} />}
          />

          <DetailCard
            icon={<User className="w-4 h-4 text-brand-400" />}
            label={detailsText.gender}
            value={
              staff.gender
                ? t.staff.form.genderOptions[
                staff.gender.toLowerCase() as "male" | "female" | "other"
                ]
                : "-"
            }
          />

          <DetailCard
            icon={<Briefcase className="w-4 h-4 text-brand-400" />}
            label={detailsText.specialization}
            value={staff.specialization || "-"}
          />

          <DetailCard
            icon={<Briefcase className="w-4 h-4 text-brand-400" />}
            label={detailsText.role}
            value={detailsText.roles[roleKey]}
          />
        </div>
      </div>

      {/* Address Section */}
      {address && (
        <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-500" />
            {detailsText.addressDetails}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {address.street && (
              <DetailCard
                icon={<Home className="w-4 h-4 text-brand-400" />}
                label={detailsText.street}
                value={address.street}
              />
            )}

            <DetailCard
              icon={<MapPin className="w-4 h-4 text-brand-400" />}
              label={detailsText.city}
              value={address.city}
            />

            <DetailCard
              icon={<MapPin className="w-4 h-4 text-brand-400" />}
              label={detailsText.state}
              value={address.state}
            />

            <DetailCard
              icon={<MapPin className="w-4 h-4 text-brand-400" />}
              label={detailsText.country}
              value={address.country}
            />

            <DetailCard
              icon={<Flag className="w-4 h-4 text-brand-400" />}
              label={detailsText.countryCode}
              value={address.countryCode || "-"}
            />

            <DetailCard
              icon={<MapPin className="w-4 h-4 text-brand-400" />}
              label={detailsText.zipCode}
              value={address.zipCode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

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
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
