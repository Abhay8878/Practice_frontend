import { CheckCircle } from "lucide-react";

export default function RegistrationSuccess() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-12 border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                    Registration Submitted!
                </h1>

                <p className="text-gray-500 text-lg mb-8">
                    Thank you for registering your practice. Your application has been sent for review. You will receive an email once your account is approved.
                </p>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        You can close this window now.
                    </p>
                </div>
            </div>
        </div>
    );
}
