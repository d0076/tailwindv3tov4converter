// Utility functions for converting between Tailwind v3 and v4 color formats

export interface ConversionResult {
  success: boolean;
  result: string;
  errors: string[];
}

// Convert HSL to OKLCH
function hslToOklch(h: number, s: number, l: number): string {
  // Convert HSL to RGB first
  const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = r + m;
  g = g + m;
  b = b + m;

  // Convert RGB to OKLCH (simplified approximation)
  const lightness = 0.299 * r + 0.587 * g + 0.114 * b;
  const chroma = Math.sqrt(
    Math.pow(r - lightness, 2) +
      Math.pow(g - lightness, 2) +
      Math.pow(b - lightness, 2)
  );
  const hue = h;

  // Format to 3 decimal places for precision
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(
    3
  )})`;
}

// Convert OKLCH to HSL (simplified approximation)
function oklchToHsl(l: number, c: number, h: number): string {
  // This is a simplified conversion - in practice, proper color space conversion libraries should be used
  const lightness = Math.round(l * 100);
  const saturation = Math.round(c * 100);
  const hue = Math.round(h);

  return `${hue} ${saturation}% ${lightness}%`;
}

// Parse HSL color value
function parseHslValue(
  value: string
): { h: number; s: number; l: number } | null {
  const match = value
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (!match) return null;

  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
  };
}

// Parse OKLCH color value
function parseOklchValue(
  value: string
): { l: number; c: number; h: number } | null {
  const match = value.trim().match(/^oklch\(([^)]+)\)$/);
  if (!match) return null;

  const parts = match[1].split(/\s+/);
  if (parts.length < 3) return null;

  // Handle alpha values (for future use)
  // const alpha = parts.length > 3 ? parts.slice(3).join(" ") : "";

  return {
    l: parseFloat(parts[0]),
    c: parseFloat(parts[1]),
    h: parseFloat(parts[2]),
  };
}

// Validate CSS variable syntax
function validateCssVariable(line: string): boolean {
  const cssVarRegex = /^\s*--[\w-]+:\s*[^;]+;?\s*$/;
  return cssVarRegex.test(line.trim());
}

// Convert V3 to V4
export function convertV3ToV4(input: string): ConversionResult {
  const errors: string[] = [];
  const lines = input.split("\n");
  const result: string[] = [];

  let inRootSection = false;
  let inDarkSection = false;
  let inLayerBase = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (
      !trimmedLine ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("//")
    ) {
      result.push(line);
      continue;
    }

    // Track sections
    if (trimmedLine.includes("@layer base")) {
      inLayerBase = true;
      // Skip @layer base wrapper in v4
      continue;
    }

    if (trimmedLine === ":root {") {
      inRootSection = true;
      result.push(line);
      continue;
    }

    if (trimmedLine === ".dark {") {
      inDarkSection = true;
      result.push(line);
      continue;
    }

    if (trimmedLine === "}") {
      if (inLayerBase && !inRootSection && !inDarkSection) {
        inLayerBase = false;
        // Skip closing @layer base
        continue;
      }
      inRootSection = false;
      inDarkSection = false;
      result.push(line);
      continue;
    }

    // Process CSS variables
    if (trimmedLine.startsWith("--") && trimmedLine.includes(":")) {
      const [property, value] = trimmedLine.split(":", 2);
      const cleanProperty = property.trim();
      const cleanValue = value.replace(";", "").trim();

      // Skip --radius as it doesn't need conversion
      if (cleanProperty === "--radius") {
        result.push(line);
        continue;
      }

      // Try to parse as HSL and convert to OKLCH
      const hslMatch = parseHslValue(cleanValue);
      if (hslMatch) {
        try {
          const oklchValue = hslToOklch(hslMatch.h, hslMatch.s, hslMatch.l);
          const indent = line.match(/^\s*/)?.[0] || "";
          result.push(`${indent}${cleanProperty}: ${oklchValue};`);
        } catch {
          errors.push(
            `Line ${i + 1}: Failed to convert HSL value "${cleanValue}"`
          );
          result.push(line);
        }
      } else {
        // Keep non-HSL values as is
        result.push(line);
      }
    } else {
      result.push(line);
    }
  }

  return {
    success: errors.length === 0,
    result: result.join("\n"),
    errors,
  };
}

// Convert V4 to V3
export function convertV4ToV3(input: string): ConversionResult {
  const errors: string[] = [];
  const lines = input.split("\n");
  const result: string[] = [];

  let inRootSection = false;
  let inDarkSection = false;
  let needsLayerBase = false;
  const rootContent: string[] = [];
  const darkContent: string[] = [];
  const otherContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (
      !trimmedLine ||
      trimmedLine.startsWith("/*") ||
      trimmedLine.startsWith("//")
    ) {
      if (inRootSection) {
        rootContent.push(line);
      } else if (inDarkSection) {
        darkContent.push(line);
      } else {
        otherContent.push(line);
      }
      continue;
    }

    // Track sections
    if (trimmedLine === ":root {") {
      inRootSection = true;
      needsLayerBase = true;
      continue;
    }

    if (trimmedLine === ".dark {") {
      inDarkSection = true;
      continue;
    }

    if (trimmedLine === "}") {
      inRootSection = false;
      inDarkSection = false;
      continue;
    }

    // Process CSS variables
    if (trimmedLine.startsWith("--") && trimmedLine.includes(":")) {
      const [property, value] = trimmedLine.split(":", 2);
      const cleanProperty = property.trim();
      const cleanValue = value.replace(";", "").trim();

      // Skip --radius as it doesn't need conversion
      if (cleanProperty === "--radius") {
        const content = inRootSection
          ? rootContent
          : inDarkSection
          ? darkContent
          : otherContent;
        content.push(line);
        continue;
      }

      // Try to parse as OKLCH and convert to HSL
      const oklchMatch = parseOklchValue(cleanValue);
      if (oklchMatch) {
        try {
          const hslValue = oklchToHsl(oklchMatch.l, oklchMatch.c, oklchMatch.h);
          const indent = line.match(/^\s*/)?.[0] || "";
          const convertedLine = `${indent}${cleanProperty}: ${hslValue};`;

          if (inRootSection) {
            rootContent.push(convertedLine);
          } else if (inDarkSection) {
            darkContent.push(convertedLine);
          } else {
            otherContent.push(convertedLine);
          }
        } catch {
          errors.push(
            `Line ${i + 1}: Failed to convert OKLCH value "${cleanValue}"`
          );
          const content = inRootSection
            ? rootContent
            : inDarkSection
            ? darkContent
            : otherContent;
          content.push(line);
        }
      } else {
        // Keep non-OKLCH values as is
        const content = inRootSection
          ? rootContent
          : inDarkSection
          ? darkContent
          : otherContent;
        content.push(line);
      }
    } else {
      const content = inRootSection
        ? rootContent
        : inDarkSection
        ? darkContent
        : otherContent;
      content.push(line);
    }
  }

  // Construct result with @layer base wrapper
  if (needsLayerBase) {
    result.push("@layer base {");
    result.push("  :root {");
    result.push(...rootContent);
    result.push("  }");
    result.push("");
    result.push("  .dark {");
    result.push(...darkContent);
    result.push("  }");
    result.push("}");
    result.push("");
    result.push(...otherContent);
  } else {
    result.push(...otherContent);
  }

  return {
    success: errors.length === 0,
    result: result.join("\n"),
    errors,
  };
}

// Validate CSS syntax
export function validateCss(input: string): string[] {
  const errors: string[] = [];
  const lines = input.split("\n");

  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Check for unmatched braces
    for (const char of line) {
      if (char === "{") braceCount++;
      if (char === "}") braceCount--;
    }

    // Check CSS variable syntax
    if (trimmedLine.startsWith("--") && !validateCssVariable(line)) {
      errors.push(`Line ${i + 1}: Invalid CSS variable syntax`);
    }
  }

  if (braceCount !== 0) {
    errors.push("Unmatched braces in CSS");
  }

  return errors;
}

// Sample data for testing
export const sampleV3Data = `@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.65rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}`;

export const sampleV4Data = `:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.623 0.214 259.815);
  --primary-foreground: oklch(0.97 0.014 254.604);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.623 0.214 259.815);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.623 0.214 259.815);
  --sidebar-primary-foreground: oklch(0.97 0.014 254.604);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.623 0.214 259.815);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.546 0.245 262.881);
  --primary-foreground: oklch(0.379 0.146 265.522);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.488 0.243 264.376);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.546 0.245 262.881);
  --sidebar-primary-foreground: oklch(0.379 0.146 265.522);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.488 0.243 264.376);
}`;
