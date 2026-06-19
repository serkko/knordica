// Knordica — lib utils
// cn() combina clsx + tailwind-merge para class merging seguro

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
