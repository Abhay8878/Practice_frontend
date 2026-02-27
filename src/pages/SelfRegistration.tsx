import SelfRegistrationForm from "../components/registration/SelfRegistrationForm";
import ClinicNotesIcon from "../assets/icons/clinical_notes.svg";
import { App_config } from "../../tailwind.config";

export default function SelfRegistration() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-200 to-white flex flex-col items-center justify-center px-6 py-10">
      {/* Card */}
      <div className="w-full max-w-5xl bg-white shadow-2xl shadow-gray-200/50 rounded-2xl overflow-hidden">
        {/* HEADER – perfectly flush */}
        <div className="bg-[#065ca2] px-8 md:px-12 py-7 md:py-8">
          <div className="flex flex-row items-center justify-left gap-3 whitespace-nowrap">
            {/* Clinic Notes Icon */}
            <img
              src={ClinicNotesIcon}
              alt="Clinic Notes"
              className="shrink-0 block"
              style={{ width: "43.1px", height: "42.23px" }}
            />

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none">
              Doctor Registration
            </h1>
          </div>

          <p className="text-blue-100 mt-2 text-lg text-left">
            Enter your Doctor details to join our network.
          </p>
        </div>

        {/* FORM CONTENT */}
        <div className="p-8 md:p-12">
          <SelfRegistrationForm />
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()}
        {App_config.brandname}
      </div>
    </div>
  );
}
