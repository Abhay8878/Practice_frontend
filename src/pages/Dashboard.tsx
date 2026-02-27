import { TotalPatientsLineChart } from "./LineGraph";
import { ChartPieLabel } from "./PieChart";
import strings from "../language";
import { useLanguage } from "../language/useLanguage";
import { App_config } from "../../tailwind.config";

export default function Dashboard() {
  const { language } = useLanguage();
  const t = strings[language];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t.dashboard.title}</h2>

      <div className="flex gap-4 items-stretch overflow-hidden">
        <div className="flex-[0.35] overflow-hidden">
          <ChartPieLabel />
        </div>

        {/* Line Chart → 65% */}
        <div className="flex-[0.65] overflow-hidden">
          <TotalPatientsLineChart />
        </div>
      </div>
      <div className="mt-10 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} {App_config.brandname}
         {strings[language].copyright}
      </div>
    </div>
  );
}
