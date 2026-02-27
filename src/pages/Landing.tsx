import { Link } from "react-router-dom";
import { UserPlus, LogIn, ArrowRight } from "lucide-react";

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-200 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-4xl z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                        Welcome to <span className="text-blue-600">AOA</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        The premier network for orthodontic and dental practices. Join us today or access your portal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {/* Sign Up Card */}
                    <Link
                        to="/register"
                        className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                    >
                        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <UserPlus className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign Up</h2>
                        <p className="text-gray-500 mb-8">
                            Register your practice to become a member of the AOA network.
                        </p>
                        <span className="mt-auto flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                    </Link>

                    {/* Sign In Card */}
                    <Link
                        to="/login"
                        className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white shadow-xl shadow-orange-900/5 hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center"
                    >
                        <div className="h-16 w-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                            <LogIn className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In</h2>
                        <p className="text-gray-500 mb-8">
                            Already a member? Log in to your dashboard to manage your doctor.
                        </p>
                        <span className="mt-auto flex items-center text-orange-600 font-semibold group-hover:gap-2 transition-all">
                            Login to Portal <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                    </Link>
                </div>
            </div>

            <div className="mt-20 text-center text-sm text-gray-400 z-10">
                &copy; {new Date().getFullYear()} AOA Network. All rights reserved.
            </div>
        </div>
    );
}
