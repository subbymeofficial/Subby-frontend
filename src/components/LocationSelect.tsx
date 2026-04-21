// Reusable cascading Country -> State -> City dropdown.
// Saves a plain formatted string ("City, State, Country") for backend
// compatibility with the existing free-text location field, while exposing
// structured parts for callers that want ISO codes.

import { useEffect, useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCurrentPlace, isNative } from "@/lib/native";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Option = { value: string; label: string; searchText: string };

interface ComboProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

function Combo({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  emptyMessage,
  searchPlaceholder,
}: ComboProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span
            className={cn(
              "truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(val, search) => {
            // cmdk lowercases both sides; our "value" is the option's searchText
            return val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder ?? "Search..."} />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? "No results found."}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.searchText}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface LocationParts {
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  city: string;
}

interface LocationSelectProps {
  /** Current formatted value, e.g. "Sydney, New South Wales, Australia". */
  value?: string;
  /**
   * Fired with both the formatted "City, State, Country" string (for storage)
   * and the structured parts (country/state ISO codes, names, etc).
   */
  onChange: (formatted: string, parts: LocationParts) => void;
  label?: string;
  /** If set, country is fixed (hides the country dropdown). ISO code, e.g. "AU". */
  lockCountry?: string;
  /** Shown under the fields. */
  helperText?: string;
  required?: boolean;
  /** If true, always render the sub-fields stacked vertically (one per row).
   * Useful inside narrow containers like the filter sidebar. */
  stacked?: boolean;
  /** Restrict the country list to these ISO codes (e.g. ["AU", "US"]). */
  allowedCountries?: string[];
}

export function LocationSelect({
  value,
  onChange,
  label = "Location",
  lockCountry,
  helperText,
  required,
  stacked,
  allowedCountries,
}: LocationSelectProps) {
  const initial = useMemo(
    () => parseLocation(value ?? "", lockCountry),
    // Only parse on mount/when the external value identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  const [countryCode, setCountryCode] = useState(initial.countryCode);
  const [stateCode, setStateCode] = useState(initial.stateCode);
  const [city, setCity] = useState(initial.city);

  const countries = useMemo(() => {
    const all = Country.getAllCountries();
    if (allowedCountries && allowedCountries.length > 0) {
      const allow = new Set(allowedCountries.map((c) => c.toUpperCase()));
      return all.filter((c) => allow.has(c.isoCode));
    }
    return all;
  }, [allowedCountries]);
  const states = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode],
  );
  const cities = useMemo(
    () =>
      countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode)
        : [],
    [countryCode, stateCode],
  );

  // Emit formatted value upward whenever any piece changes.
  useEffect(() => {
    const countryObj = countries.find((c) => c.isoCode === countryCode);
    const stateObj = states.find((s) => s.isoCode === stateCode);
    const parts: LocationParts = {
      countryCode,
      countryName: countryObj?.name ?? "",
      stateCode,
      stateName: stateObj?.name ?? "",
      city,
    };
    const formatted = [parts.city, parts.stateName, parts.countryName]
      .filter(Boolean)
      .join(", ");
    onChange(formatted, parts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, stateCode, city]);

  const countryOptions: Option[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.isoCode,
        label: `${c.flag ?? ""} ${c.name}`.trim(),
        searchText: `${c.name} ${c.isoCode}`,
      })),
    [countries],
  );
  const stateOptions: Option[] = useMemo(
    () =>
      states.map((s) => ({
        value: s.isoCode,
        label: s.name,
        searchText: `${s.name} ${s.isoCode}`,
      })),
    [states],
  );
  const cityOptions: Option[] = useMemo(
    () =>
      cities.map((c) => ({
        value: c.name,
        label: c.name,
        searchText: c.name,
      })),
    [cities],
  );

  const noStates = !!countryCode && states.length === 0;
  // Some tiny countries have no state data but plenty of cities listed directly.
  // country-state-city ties cities to states, so for those we just allow typing.
  const [cityFallback, setCityFallback] = useState("");

  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const place = await getCurrentPlace();
      if (!place) {
        toast({
          title: "Location unavailable",
          description:
            "We couldn't read your location. Check that location access is enabled.",
          variant: "destructive",
        });
        return;
      }

      // Only apply if the detected country is in the allowed list (if set)
      const code = place.countryCode ?? "";
      if (allowedCountries && allowedCountries.length > 0) {
        const allow = new Set(allowedCountries.map((c) => c.toUpperCase()));
        if (!allow.has(code)) {
          toast({
            title: "Unsupported region",
            description: `${place.country ?? "That country"} isn't supported yet.`,
            variant: "destructive",
          });
          return;
        }
      }

      if (code && !lockCountry) setCountryCode(code);

      // Best-effort state match by name
      if (code && place.state) {
        const stateMatch = State.getStatesOfCountry(code).find(
          (s) =>
            s.name.toLowerCase() === place.state!.toLowerCase() ||
            s.isoCode.toLowerCase() === place.state!.toLowerCase(),
        );
        if (stateMatch) setStateCode(stateMatch.isoCode);
      }

      if (place.city) {
        setCity(place.city);
        setCityFallback(place.city);
      }
    } finally {
      setLocating(false);
    }
  };

  // Only show "Use my location" on the native app — keep the web UI untouched.
  const showUseMyLocation = isNative();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {showUseMyLocation && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary hover:text-primary"
            onClick={useMyLocation}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <MapPin className="mr-1 h-3 w-3" />
            )}
            Use my location
          </Button>
        )}
      </div>
      <div
        className={cn(
          "grid gap-2",
          stacked
            ? "grid-cols-1"
            : lockCountry
              ? "sm:grid-cols-2"
              : "sm:grid-cols-3",
        )}
      >
        {!lockCountry && (
          <Combo
            options={countryOptions}
            value={countryCode}
            onChange={(v) => {
              setCountryCode(v);
              setStateCode("");
              setCity("");
              setCityFallback("");
            }}
            placeholder="Country"
            searchPlaceholder="Search country..."
          />
        )}
        {noStates ? (
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Region / City"
              value={cityFallback}
              onChange={(e) => {
                setCityFallback(e.target.value);
                setCity(e.target.value);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        ) : (
          <>
            <Combo
              options={stateOptions}
              value={stateCode}
              onChange={(v) => {
                setStateCode(v);
                setCity("");
              }}
              placeholder={countryCode ? "State / Region" : "Pick a country first"}
              disabled={!countryCode || stateOptions.length === 0}
              emptyMessage="No matching states."
              searchPlaceholder="Search state..."
            />
            <Combo
              options={cityOptions}
              value={city}
              onChange={setCity}
              placeholder={stateCode ? "City" : "Pick a state first"}
              disabled={!stateCode || cityOptions.length === 0}
              emptyMessage="No matching cities."
              searchPlaceholder="Search city..."
            />
          </>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Try to recover country/state/city from an existing plain-text value.
function parseLocation(input: string, lockCountry?: string): LocationParts {
  const blank: LocationParts = {
    countryCode: lockCountry ?? "",
    countryName: "",
    stateCode: "",
    stateName: "",
    city: "",
  };
  if (!input) return blank;

  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  let { countryCode } = blank;
  let stateCode = "";
  const city = parts[0] ?? "";

  if (parts.length >= 3) {
    const countryText = parts[parts.length - 1];
    const countryMatch = Country.getAllCountries().find(
      (c) =>
        c.name.toLowerCase() === countryText.toLowerCase() ||
        c.isoCode.toLowerCase() === countryText.toLowerCase(),
    );
    if (countryMatch) countryCode = countryMatch.isoCode;

    if (countryCode) {
      const stateText = parts[parts.length - 2];
      const stateMatch = State.getStatesOfCountry(countryCode).find(
        (s) =>
          s.name.toLowerCase() === stateText.toLowerCase() ||
          s.isoCode.toLowerCase() === stateText.toLowerCase(),
      );
      if (stateMatch) stateCode = stateMatch.isoCode;
    }
  }

  return { countryCode, countryName: "", stateCode, stateName: "", city };
}
// Reusable cascading Country -> State -> City dropdown.
// Saves a plain formatted string ("City, State, Country") for backend
// compatibility with the existing free-text location field, while exposing
// structured parts for callers that want ISO codes.

import { useEffect, useMemo, useState } from "react";
import { Country, State, City } from "country-state-city";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Option = { value: string; label: string; searchText: string };

interface ComboProps {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

function Combo({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  emptyMessage,
  searchPlaceholder,
}: ComboProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span
            className={cn(
              "truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(val, search) => {
            // cmdk lowercases both sides; our "value" is the option's searchText
            return val.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={searchPlaceholder ?? "Search..."} />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? "No results found."}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.searchText}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export interface LocationParts {
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  city: string;
}

interface LocationSelectProps {
  /** Current formatted value, e.g. "Sydney, New South Wales, Australia". */
  value?: string;
  /**
   * Fired with both the formatted "City, State, Country" string (for storage)
   * and the structured parts (country/state ISO codes, names, etc).
   */
  onChange: (formatted: string, parts: LocationParts) => void;
  label?: string;
  /** If set, country is fixed (hides the country dropdown). ISO code, e.g. "AU". */
  lockCountry?: string;
  /** Shown under the fields. */
  helperText?: string;
  required?: boolean;
  /** If true, always render the sub-fields stacked vertically (one per row).
   * Useful inside narrow containers like the filter sidebar. */
  stacked?: boolean;
  /** Restrict the country list to these ISO codes (e.g. ["AU", "US"]). */
  allowedCountries?: string[];
}

export function LocationSelect({
  value,
  onChange,
  label = "Location",
  lockCountry,
  helperText,
  required,
  stacked,
  allowedCountries,
}: LocationSelectProps) {
  const initial = useMemo(
    () => parseLocation(value ?? "", lockCountry),
    // Only parse on mount/when the external value identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  const [countryCode, setCountryCode] = useState(initial.countryCode);
  const [stateCode, setStateCode] = useState(initial.stateCode);
  const [city, setCity] = useState(initial.city);

  const countries = useMemo(() => {
    const all = Country.getAllCountries();
    if (allowedCountries && allowedCountries.length > 0) {
      const allow = new Set(allowedCountries.map((c) => c.toUpperCase()));
      return all.filter((c) => allow.has(c.isoCode));
    }
    return all;
  }, [allowedCountries]);
  const states = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode],
  );
  const cities = useMemo(
    () =>
      countryCode && stateCode
        ? City.getCitiesOfState(countryCode, stateCode)
        : [],
    [countryCode, stateCode],
  );

  // Emit formatted value upward whenever any piece changes.
  useEffect(() => {
    const countryObj = countries.find((c) => c.isoCode === countryCode);
    const stateObj = states.find((s) => s.isoCode === stateCode);
    const parts: LocationParts = {
      countryCode,
      countryName: countryObj?.name ?? "",
      stateCode,
      stateName: stateObj?.name ?? "",
      city,
    };
    const formatted = [parts.city, parts.stateName, parts.countryName]
      .filter(Boolean)
      .join(", ");
    onChange(formatted, parts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, stateCode, city]);

  const countryOptions: Option[] = useMemo(
    () =>
      countries.map((c) => ({
        value: c.isoCode,
        label: `${c.flag ?? ""} ${c.name}`.trim(),
        searchText: `${c.name} ${c.isoCode}`,
      })),
    [countries],
  );
  const stateOptions: Option[] = useMemo(
    () =>
      states.map((s) => ({
        value: s.isoCode,
        label: s.name,
        searchText: `${s.name} ${s.isoCode}`,
      })),
    [states],
  );
  const cityOptions: Option[] = useMemo(
    () =>
      cities.map((c) => ({
        value: c.name,
        label: c.name,
        searchText: c.name,
      })),
    [cities],
  );

  const noStates = !!countryCode && states.length === 0;
  // Some tiny countries have no state data but plenty of cities listed directly.
  // country-state-city ties cities to states, so for those we just allow typing.
  const [cityFallback, setCityFallback] = useState("");

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div
        className={cn(
          "grid gap-2",
          stacked
            ? "grid-cols-1"
            : lockCountry
              ? "sm:grid-cols-2"
              : "sm:grid-cols-3",
        )}
      >
        {!lockCountry && (
          <Combo
            options={countryOptions}
            value={countryCode}
            onChange={(v) => {
              setCountryCode(v);
              setStateCode("");
              setCity("");
              setCityFallback("");
            }}
            placeholder="Country"
            searchPlaceholder="Search country..."
          />
        )}
        {noStates ? (
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Region / City"
              value={cityFallback}
              onChange={(e) => {
                setCityFallback(e.target.value);
                setCity(e.target.value);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
        ) : (
          <>
            <Combo
              options={stateOptions}
              value={stateCode}
              onChange={(v) => {
                setStateCode(v);
                setCity("");
              }}
              placeholder={countryCode ? "State / Region" : "Pick a country first"}
              disabled={!countryCode || stateOptions.length === 0}
              emptyMessage="No matching states."
              searchPlaceholder="Search state..."
            />
            <Combo
              options={cityOptions}
              value={city}
              onChange={setCity}
              placeholder={stateCode ? "City" : "Pick a state first"}
              disabled={!stateCode || cityOptions.length === 0}
              emptyMessage="No matching cities."
              searchPlaceholder="Search city..."
            />
          </>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

// Try to recover country/state/city from an existing plain-text value.
function parseLocation(input: string, lockCountry?: string): LocationParts {
  const blank: LocationParts = {
    countryCode: lockCountry ?? "",
    countryName: "",
    stateCode: "",
    stateName: "",
    city: "",
  };
  if (!input) return blank;

  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  let { countryCode } = blank;
  let stateCode = "";
  const city = parts[0] ?? "";

  if (parts.length >= 3) {
    const countryText = parts[parts.length - 1];
    const countryMatch = Country.getAllCountries().find(
      (c) =>
        c.name.toLowerCase() === countryText.toLowerCase() ||
        c.isoCode.toLowerCase() === countryText.toLowerCase(),
    );
    if (countryMatch) countryCode = countryMatch.isoCode;

    if (countryCode) {
      const stateText = parts[parts.length - 2];
      const stateMatch = State.getStatesOfCountry(countryCode).find(
        (s) =>
          s.name.toLowerCase() === stateText.toLowerCase() ||
          s.isoCode.toLowerCase() === stateText.toLowerCase(),
      );
      if (stateMatch) stateCode = stateMatch.isoCode;
    }
  }

  return { countryCode, countryName: "", stateCode, stateName: "", city };
}
