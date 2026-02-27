import { useState, useRef, useEffect } from "react";
import { FiUser, FiLogOut, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../language/useLanguage";
import { useMasking } from "../context/MaskingContext";
import strings from "../language";

import { App_config } from "../../tailwind.config";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";

import { Button } from "../components/ui/button";
import { ChevronDown } from "lucide-react";

const LANGUAGES = ["en", "fr", "sp", "jp"] as const;

export default function Navbar() {
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { isMasked, toggleMasking } = useMasking();
  const t = strings[language];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 w-full flex items-center justify-between border-b border-white/20 px-8 text-white shadow-md bg-brand">
      <div className="flex items-center gap-4">
        {/* Circular Logo */}
        <div className="
  h-10 w-10
  rounded-full
  bg-white
  flex items-center justify-center
  shadow-md
  ring-2 ring-white/30
  overflow-hidden
  transition-all duration-300
  hover:scale-105
">
          <img
            src={App_config.BRAND_LOGO}
            alt="Logo"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl font-semibold tracking-wide">
          {App_config.brandname}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* 👁 EMAIL MASKING TOGGLE */}
        <button
          onClick={toggleMasking}
          className="flex items-center justify-center w-8 h-8 bg-white text-brand-500 rounded hover:bg-brand-100 transition-colors"
        >
          {isMasked ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>

        {/* 🌍 Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-2 text-xs font-semibold text-brand-500 bg-white hover:bg-brand-100"
            >
              {language.toUpperCase()}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            sideOffset={2}
            align="center"
            className="min-w-[65px] p-1"
          >
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`text-xs justify-center cursor-pointer px-2 py-1 ${language === lang ? "font-semibold bg-gray-100" : ""
                  }`}
              >
                {lang.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 👤 User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((p) => !p)}
            className="w-10 h-10 flex items-center justify-center bg-white text-brand-500 rounded-full hover:bg-brand-100"
          >
            <FiUser size={20} />
          </button>

          {userOpen && (
            <div className="absolute left-1/2 mt-3 w-28 -translate-x-1/2 bg-white rounded shadow z-50">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm bg-brand-button text-white hover:bg-brand-button/80 rounded"
              >
                <FiLogOut size={16} />
                {t.navbar.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
