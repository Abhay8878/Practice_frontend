import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart";

import { useLanguage } from "../language/useLanguage";
import strings from "../language";

export function TotalPatientsLineChart() {
  const { language } = useLanguage();
  const t = strings[language];

  const chartData = [
    { month: "August", patients: 140 },
    { month: "September", patients: 190 },
    { month: "October", patients: 250 },
    { month: "November", patients: 280 },
    { month: "December", patients: 370 },
    { month: "January", patients: 90 },
  ];

  const chartConfig: ChartConfig = {
    patients: { label: t.charts.totalPatients.label, color: "var(--chart-1)" },
  };

  return (
    <Card className="h-full min-h-[300px] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{t.charts.totalPatients.title}</CardTitle>
        <CardDescription>{t.charts.totalPatients.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart data={chartData} margin={{ left: 8, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line dataKey="patients" type="natural" stroke="var(--color-patients)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
        <div className="flex gap-2 font-medium">{t.charts.totalPatients.footerTrending} <TrendingUp className="h-4 w-4" /></div>
        <div className="text-muted-foreground">{t.charts.totalPatients.footerNote}</div>
      </CardFooter>
    </Card>
  );
}
