import { format } from "date-fns";
import type { Patient } from "../../../types/patientType";
import { User, Mail, Phone, Calendar, MapPin, Home, Flag } from "lucide-react";
import MaskedEmail from "../../common/MaskedEmail";
import MaskedPhone from "../../common/MaskedPhone";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  patient: Patient;
};

export function PatientDetails({ patient }: Props) {
  const { language } = useLanguage();
  const t = strings[language];
  const detailsText = t.patients.details;

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
            value={`${patient.firstName} ${patient.lastName}`}
          />

          <DetailCard
            icon={<Mail className="w-4 h-4 text-brand-400" />}
            label={detailsText.email}
            value={<MaskedEmail email={patient.email} />}
          />

          <DetailCard
            icon={<Phone className="w-4 h-4 text-brand-400" />}
            label={detailsText.phoneNumber}
            value={<MaskedPhone phone={patient.contact} />}
          />

          <DetailCard
            icon={<User className="w-4 h-4 text-brand-400" />}
            label={detailsText.gender}
            value={
              patient.gender
                ? t.patients.form.genderOptions[
                patient.gender.toLowerCase() as "male" | "female" | "other"
                ]
                : "-"
            }
          />

          <DetailCard
            icon={<Calendar className="w-4 h-4 text-brand-400" />}
            label={detailsText.dateOfBirth}
            value={patient.dob ? format(patient.dob, "MM-dd-yyyy") : "-"}
          />
        </div>
      </div>

      {/* Address Section */}
      {(patient.address ||
        (patient.addresses && patient.addresses.length > 0)) && (
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 border border-brand-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              {detailsText.addressDetails}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const address =
                  patient.address ||
                  (patient.addresses && patient.addresses[0]);

                if (!address) return null;

                return (
                  <>
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
                  </>
                );
              })()}
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
