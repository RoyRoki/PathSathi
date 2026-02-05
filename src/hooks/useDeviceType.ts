"use client";

import { useState, useEffect } from "react";

type DeviceType = "desktop" | "mobile";

export function useDeviceType(breakpoint: number = 768): DeviceType {
    // Lazy initialization to avoid setState during render
    const [deviceType, setDeviceType] = useState<DeviceType>(() => {
        if (typeof window === "undefined") return "desktop";
        return window.innerWidth >= breakpoint ? "desktop" : "mobile";
    });

    useEffect(() => {
        const checkDevice = () => {
            const newDeviceType = window.innerWidth >= breakpoint ? "desktop" : "mobile";
            setDeviceType(newDeviceType);
        };

        // Listen for resize
        window.addEventListener("resize", checkDevice);

        return () => window.removeEventListener("resize", checkDevice);
    }, [breakpoint]);

    return deviceType;
}
