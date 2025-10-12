
'use client';

import { motion } from 'framer-motion';

interface SpeedMeterProps {
  speed: number; // in Mbps
  maxSpeed?: number;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}


export function SpeedMeter({ speed, maxSpeed = 100 }: SpeedMeterProps) {
    const size = 300;
    const center = size / 2;
    const strokeWidth = 20;
    const radius = center - strokeWidth;

    const startAngle = 135;
    const endAngle = 405; // 135 + 270
    const range = endAngle - startAngle;

    const value = Math.min(Math.max(speed, 0), maxSpeed) / maxSpeed;
    const valueAngle = startAngle + (value * range);

    const backgroundArc = describeArc(center, center, radius, startAngle, endAngle);
    const valueArc = describeArc(center, center, radius, startAngle, valueAngle);
    
    const tickCount = 5;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
        const tickValue = (i * maxSpeed) / tickCount;
        const angle = startAngle + (i * (range / tickCount));
        const pos = polarToCartesian(center, center, radius - 25, angle);
        return { value: tickValue, ...pos };
    });

    const needleRotation = startAngle + (value * range) + 90;

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="speed-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--dash-primary))" />
                        <stop offset="100%" stopColor="hsl(180, 80%, 40%)" />
                    </linearGradient>
                </defs>

                {/* Background Gauge */}
                <path
                    d={backgroundArc}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />

                {/* Progress Arc */}
                <motion.path
                    d={valueArc}
                    fill="none"
                    stroke="url(#speed-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Ticks */}
                {ticks.map((tick) => (
                    <text
                        key={tick.value}
                        x={tick.x}
                        y={tick.y}
                        dy="0.35em"
                        textAnchor="middle"
                        className="text-sm font-medium text-muted-foreground fill-current"
                    >
                        {tick.value}
                    </text>
                ))}
                
                {/* Needle */}
                <g transform={`rotate(${needleRotation} ${center} ${center})`}>
                    <path d={`M ${center} ${center - 5} L ${center} ${strokeWidth - 5}`} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
                    <circle cx={center} cy={center} r="6" fill="hsl(var(--foreground))" />
                    <circle cx={center} cy={center} r="3" fill="hsl(var(--background))" />
                </g>

                {/* Speed Text */}
                <motion.text
                    x={center}
                    y={center + 50}
                    textAnchor="middle"
                    className="text-5xl font-bold text-foreground fill-current"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {speed.toFixed(1)}
                </motion.text>
                 <text
                    x={center}
                    y={center + 80}
                    textAnchor="middle"
                    className="text-xl font-medium text-muted-foreground fill-current"
                >
                    Mbps
                </text>
            </svg>
        </div>
    );
}
