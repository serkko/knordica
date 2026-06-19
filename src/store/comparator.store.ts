import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PropertyCard } from "@/types/property";

interface ComparatorState {
  selectedProperties: PropertyCard[];
  addProperty: (property: PropertyCard) => boolean; // returns true if added, false if full or already exists
  removeProperty: (id: string) => void;
  clearComparator: () => void;
  isCompared: (id: string) => boolean;
}

export const useComparatorStore = create<ComparatorState>()(
  persist(
    (set, get) => ({
      selectedProperties: [],
      
      addProperty: (property) => {
        const { selectedProperties } = get();
        
        // Prevent duplicate
        if (selectedProperties.some((p) => p.id === property.id)) {
          return false;
        }
        
        // Limit to 3 properties
        if (selectedProperties.length >= 3) {
          return false;
        }
        
        set({ selectedProperties: [...selectedProperties, property] });
        return true;
      },
      
      removeProperty: (id) => {
        set({
          selectedProperties: get().selectedProperties.filter((p) => p.id !== id),
        });
      },
      
      clearComparator: () => {
        set({ selectedProperties: [] });
      },
      
      isCompared: (id) => {
        return get().selectedProperties.some((p) => p.id === id);
      },
    }),
    {
      name: "knordica-comparator-storage", // persist selections in LocalStorage
    }
  )
);
