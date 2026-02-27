import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import Navbar from "./pages/Navbar";
import AppSidebar from "./pages/AppSidebar";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/Patients";
import StaffPage from "./pages/staff/Staff";
import ProductListPage from "./components/form/product/ProductList";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import SelfRegistration from "./pages/SelfRegistration";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import ChatPage from "./modules/chat/ChatPage";
import { LanguageProvider } from "./language/LanguageContext";
import { MaskingProvider } from "./context/MaskingContext";
import { ChatSocketProvider } from "./modules/chat/context/ChatSocketContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("accessToken");
  const practitionerType = localStorage.getItem("practitionerType");

  // Allow both Practice and Team Member users
  if (
    !token ||
    (practitionerType !== "Practice" && practitionerType !== "Team Member" && practitionerType !== "Admin")
  ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <LanguageProvider>
      <MaskingProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes - Registration flow */}
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<SelfRegistration />} />
            <Route path="/success" element={<RegistrationSuccess />} />

            {/* Login */}
            <Route path="/login" element={<Login />} />

            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <ChatSocketProvider>
                    <SidebarProvider defaultOpen={false}>
                      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
                        <Navbar />

                        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                          <AppSidebar />

                          <SidebarInset className="w-full overflow-hidden">
                            <main className="h-full w-full p-6 bg-muted/40 overflow-y-auto">
                              <Routes>
                                <Route path="dashboard" element={<Dashboard />} />

                                <Route path="patients" element={<PatientList />} />

                                {/* Product List */}
                                <Route
                                  path="patients/:patientId/products"
                                  element={<ProductListPage />}
                                />

                                {/* Product Details */}
                                <Route
                                  path="patients/:patientId/products/:orderId"
                                  element={<ProductListPage />}
                                />

                                <Route path="staff" element={<StaffPage />} />

                                <Route path="chat" element={<ChatPage />} />

                                {/* ⚠️ ALWAYS KEEP THIS LAST */}
                                <Route
                                  path="*"
                                  element={<Navigate to="/login" replace />}
                                />
                              </Routes>
                            </main>
                          </SidebarInset>
                        </div>
                      </div>
                    </SidebarProvider>
                  </ChatSocketProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </MaskingProvider>
    </LanguageProvider>
  );
}
