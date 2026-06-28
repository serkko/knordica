"use client";

import React, { use, Suspense } from "react";
import { PropertyForm } from "@/components/panel/PropertyForm";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ new?: string }>;
}

function EditarPropiedadInner({ locale, id, isNew }: { locale: string; id: string; isNew: boolean }) {
  return <PropertyForm locale={locale} propertyId={id} isNew={isNew} />;
}

export default function EditarPropiedadPage({ params, searchParams }: PageProps) {
  const { locale, id } = use(params);
  const { new: isNewParam } = use(searchParams);
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 min-h-[300px]"><div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--p-accent)" }} /></div>}>
      <EditarPropiedadInner locale={locale} id={id} isNew={isNewParam === "true"} />
    </Suspense>
  );
}
