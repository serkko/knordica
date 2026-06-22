"use client";

import React, { use } from "react";
import { PropertyForm } from "@/components/panel/PropertyForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function NuevaPropiedadPage({ params }: PageProps) {
  const { locale } = use(params);
  return <PropertyForm locale={locale} />;
}
