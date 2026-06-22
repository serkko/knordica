"use client";

import React, { use } from "react";
import { PropertyForm } from "@/components/panel/PropertyForm";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function EditarPropiedadPage({ params }: PageProps) {
  const { locale, id } = use(params);
  return <PropertyForm locale={locale} propertyId={id} />;
}
