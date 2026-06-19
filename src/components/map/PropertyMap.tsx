"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PropertyCard } from "@/types/property";

interface PropertyMapProps {
  properties: PropertyCard[];
  hoveredPropertyId: string | null;
  onMarkerClick?: (property: PropertyCard) => void;
  center?: [number, number];
  zoom?: number;
}

export default function PropertyMap({
  properties,
  hoveredPropertyId,
  onMarkerClick,
  center = [8.596, -71.14], // Mérida, Venezuela
  zoom = 13,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const tilesRef = useRef<L.TileLayer | null>(null);

  // Formatter for prices
  const formatPriceCompact = (price: number, currency: string) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}k`;
    }
    return `$${price}`;
  };

  // Determine current theme from HTML class or data attribute
  const getMapTilesUrl = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark") || 
                     document.documentElement.getAttribute("data-theme") === "dark";
      return isDark 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    }
    return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false, // We'll add zoom controls manually
      attributionControl: false,
    });

    // Add Tile Layer
    const tileUrl = getMapTilesUrl();
    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    mapRef.current = map;
    tilesRef.current = tiles;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update theme of map tiles when document theme changes
  useEffect(() => {
    if (!mapRef.current || !tilesRef.current) return;

    // Setup Mutation Observer to watch class or data-theme changes on html
    const observer = new MutationObserver(() => {
      if (tilesRef.current && mapRef.current) {
        const newUrl = getMapTilesUrl();
        tilesRef.current.setUrl(newUrl);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Filter properties that have coordinates
    const validProperties = properties.filter((p) => p.lat && p.lng);

    validProperties.forEach((p) => {
      const priceText = formatPriceCompact(p.price, p.price_currency);
      const isHovered = hoveredPropertyId === p.id;
      const color = p.operation === "venta" ? "#C9A96E" : "#2DD4BF";

      // HTML custom price-tag marker
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative group cursor-pointer transition-all duration-300 ${isHovered ? "scale-110 z-50" : ""}">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border bg-zinc-950/90 text-[10.5px] font-bold shadow-md whitespace-nowrap transition-all duration-300"
                 style="border-color: ${color}; color: ${isHovered ? "#FFFFFF" : "rgba(240, 237, 232, 0.95)"}; box-shadow: ${isHovered ? `0 0 10px ${color}` : "none"}; transform: ${isHovered ? "translateY(-4px)" : "none"}">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: ${color};"></span>
              <span>${priceText}</span>
            </div>
            <div class="w-1.5 h-1.5 rotate-45 border-r border-b bg-zinc-950 absolute left-1/2 -translate-x-1/2 -bottom-0.5 transition-transform duration-300"
                 style="border-color: ${color}; transform: ${isHovered ? "translate(-50%, -2px) rotate(45deg)" : "translate(-50%, 0) rotate(45deg)"}"></div>
          </div>
        `,
        iconSize: [60, 28],
        iconAnchor: [30, 28],
      });

      const marker = L.marker([p.lat!, p.lng!], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          if (onMarkerClick) {
            onMarkerClick(p);
          }
        });

      // Simple elegant Popup
      const popupHtml = `
        <div class="p-1 max-w-[200px] font-body bg-zinc-950 text-white rounded-sm">
          ${p.cover_image?.url ? `
            <div class="aspect-[16/10] w-full rounded-sm overflow-hidden mb-2">
              <img src="${p.cover_image.url}" alt="${p.title}" class="w-full h-full object-cover" />
            </div>
          ` : ""}
          <p class="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-0.5">${p.operation}</p>
          <h4 class="text-xs font-bold text-white line-clamp-1 mb-1 font-display">${p.title}</h4>
          <p class="text-xs font-bold text-[var(--gold)] mb-1">${new Intl.NumberFormat("es-VE", { style: "currency", currency: p.price_currency, maximumFractionDigits: 0 }).format(p.price)}</p>
          <a href="/es/propiedades/${p.slug}" class="text-[10px] font-semibold uppercase text-teal-400 hover:underline">Ver detalles →</a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: "custom-leaflet-popup",
      });

      markersRef.current[p.id] = marker;
    });

    // Auto fit bounds if there are valid markers
    if (validProperties.length > 0) {
      const group = L.featureGroup(validProperties.map((p) => L.marker([p.lat!, p.lng!])));
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 15 });
    }
  }, [properties]);

  // Sync Highlight/Hover state
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (hoveredPropertyId) {
      const marker = markersRef.current[hoveredPropertyId];
      if (marker) {
        const latLng = marker.getLatLng();
        map.panTo(latLng);
        
        // Temporarily open the popup on hover (optional, but let's just make it focus)
        // marker.openPopup();
      }
    }
  }, [hoveredPropertyId]);

  return (
    <div className="relative w-full h-full">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full bg-zinc-950 min-h-[300px]" />
      
      {/* Style overrides for Leaflet popups and elements */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #17171b !important;
          color: #f0ede8 !important;
          border: 1px border var(--border-strong) !important;
          border-radius: 4px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: #17171b !important;
        }
        .leaflet-container {
          font-family: var(--font-body), sans-serif !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 6px 8px !important;
        }
        .leaflet-bar {
          border: 1px solid var(--border) !important;
          box-shadow: none !important;
        }
        .leaflet-bar a {
          background-color: var(--surface) !important;
          color: var(--text) !important;
          border-bottom: 1px solid var(--border) !important;
          transition: background-color 200ms, color 200ms;
        }
        .leaflet-bar a:hover {
          background-color: var(--surface-hover) !important;
          color: var(--accent) !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          font-family: monospace !important;
        }
      `}</style>
    </div>
  );
}
