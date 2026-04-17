"use client";

import { useEffect } from "react";
import { ensureSeed } from "@/lib/store";

export default function SeedBoot() {
  useEffect(() => {
    ensureSeed();
  }, []);
  return null;
}
