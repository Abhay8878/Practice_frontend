"use client";
import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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

export function ChartPieLabel() {
  const { language } = useLanguage();
  const t = strings[language]

  const chartData = [
    { status: "REJECTED", products: 60, fill: "var(--color-chrome)" },
    { status: "PENDING", products: 30, fill: "var(--color-safari)" },
    { status: "COMPLETED", products: 87, fill: "var(--color-firefox)" },
  ];

  const chartConfig: ChartConfig = {
    products: { label: "Products" },
    chrome: { label: t.charts.orderStatus.statuses.REJECTED, color: "var(--chart-1)" },
    safari: { label: t.charts.orderStatus.statuses.PENDING, color: "var(--chart-2)" },
    firefox: { label: t.charts.orderStatus.statuses.COMPLETED, color: "var(--chart-3)" },
  };

  return (
    <Card className="h-full min-h-[300px] overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle>{t.charts.orderStatus.title}</CardTitle>
        <CardDescription>{t.charts.orderStatus.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
          <PieChart margin={{ left: 40, right: 40, top: 40, bottom: 40 }}>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="products"
              nameKey="status"
              label={({ name }) => t.charts.orderStatus.statuses[name as keyof typeof t.charts.orderStatus.statuses]}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
        <div className="flex gap-2 font-medium">{t.charts.orderStatus.footerTrending} <TrendingUp className="h-4 w-4" /></div>
        <div className="text-muted-foreground">{t.charts.orderStatus.footerNote}</div>
      </CardFooter>
    </Card>
  );
}
