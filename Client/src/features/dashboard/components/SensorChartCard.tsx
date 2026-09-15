import React from 'react';
import { Typography } from 'antd';
import type {
  SensorMetric,
  SensorPoint,
} from '@/features/dashboard/types/dashboard.types';

const { Text } = Typography;

interface SensorChartCardProps {
  type: SensorMetric;
  title: string;
  unit: string;
  currentValue: number;
  color: string;
  iconBg: string;
  icon: React.ReactNode;
  maxThreshold?: number;
  minThreshold?: number;
  yMin: number;
  yMax: number;
  yTicks: number[];
  data: SensorPoint[];
}

/**
 * Thuật toán tạo đường cong Spline mượt mà (Cubic Bézier Catmull-Rom)
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export const SensorChartCard: React.FC<SensorChartCardProps> = ({
  title,
  unit,
  currentValue,
  color,
  iconBg,
  icon,
  maxThreshold,
  minThreshold,
  yMin,
  yMax,
  yTicks,
  data,
}) => {
  // Kích thước SVG Chart chuẩn màn hình rộng
  const svgWidth = 850;
  const svgHeight = 150;
  const paddingLeft = 50;
  const paddingRight = 24;
  const paddingTop = 15;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Chuyển đổi dữ liệu sang tọa độ SVG
  const points = data.map((pt, index) => {
    const x = paddingLeft + (index / Math.max(1, data.length - 1)) * chartWidth;
    const normalizedY = (pt.value - yMin) / (yMax - yMin);
    const y = paddingTop + (1 - Math.max(0, Math.min(1, normalizedY))) * chartHeight;
    return { x, y };
  });

  const curvePath = generateSmoothPath(points);

  // Tính tọa độ Y của đường ngưỡng trên (Max Threshold)
  const maxThresholdY =
    maxThreshold !== undefined && maxThreshold >= yMin && maxThreshold <= yMax
      ? paddingTop + (1 - (maxThreshold - yMin) / (yMax - yMin)) * chartHeight
      : undefined;

  // Tính tọa độ Y của đường ngưỡng dưới (Min Threshold)
  const minThresholdY =
    minThreshold !== undefined && minThreshold >= yMin && minThreshold <= yMax
      ? paddingTop + (1 - (minThreshold - yMin) / (yMax - yMin)) * chartHeight
      : undefined;

  return (
    <div className="bg-white rounded-[24px] border-[1.5px] border-solid border-[#e2e8f0] px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4 w-full box-border flex-1 min-h-[180px]">
      {/* 1. Phần thông tin bên trái (Info Box) */}
      <div className="w-[155px] min-w-[145px] flex flex-col items-center justify-center pr-4 border-r-[1.5px] border-dashed border-slate-200 select-none">
        {/* Icon tròn có màu nền tương ứng */}
        <div
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-2.5"
          style={{
            backgroundColor: iconBg,
            boxShadow: `0 4px 12px ${color}25`,
          }}
        >
          {icon}
        </div>

        {/* Tiêu đề thông số */}
        <Text className="!text-[13px] !font-semibold !text-slate-500 text-center">
          {title}
        </Text>

        {/* Giá trị lớn */}
        <div className="text-2xl font-extrabold text-slate-900 mt-1 text-center">
          {currentValue}
          <span className="text-base font-semibold ml-0.5 text-slate-500">
            {unit}
          </span>
        </div>
      </div>

      {/* 2. Phần Biểu đồ đường bên phải (SVG Curve Chart) */}
      <div className="flex-1 overflow-hidden relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block"
        >
          {/* Trục Y: Các mốc giá trị bên trái */}
          {yTicks.map((tick) => {
            const tickY = paddingTop + (1 - (tick - yMin) / (yMax - yMin)) * chartHeight;
            return (
              <text
                key={tick}
                x={paddingLeft - 8}
                y={tickY + 4}
                textAnchor="end"
                fontSize={10}
                fill="#94a3b8"
                fontWeight={500}
              >
                {tick}
              </text>
            );
          })}

          {/* Đường nét đứt hiển thị NGƯỠNG TRÊN (Max Threshold Line) */}
          {maxThresholdY !== undefined && (
            <line
              x1={paddingLeft}
              y1={maxThresholdY}
              x2={svgWidth - paddingRight}
              y2={maxThresholdY}
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              strokeOpacity={0.85}
            />
          )}

          {/* Đường nét đứt hiển thị NGƯỠNG DƯỚI (Min Threshold Line) */}
          {minThresholdY !== undefined && (
            <line
              x1={paddingLeft}
              y1={minThresholdY}
              x2={svgWidth - paddingRight}
              y2={minThresholdY}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              strokeOpacity={0.85}
            />
          )}

          {/* Đường cong dữ liệu mềm mại (Spline curve) */}
          <path
            d={curvePath}
            fill="none"
            stroke={color}
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Điểm tròn nổi bật ở giá trị mới nhất */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill={color}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}

          {/* Trục X: Các mốc thời gian bên dưới */}
          {data.map((pt, i) => {
            const x = paddingLeft + (i / Math.max(1, data.length - 1)) * chartWidth;
            const showLabel = i % 2 === 0 || i === data.length - 1;
            if (!showLabel) return null;

            return (
              <text
                key={i}
                x={x}
                y={svgHeight - 8}
                textAnchor="middle"
                fontSize={9.5}
                fill="#94a3b8"
                fontWeight={500}
              >
                {pt.time}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default SensorChartCard;
