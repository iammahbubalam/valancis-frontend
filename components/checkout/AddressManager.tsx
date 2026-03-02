"use client";

import { useState, useEffect } from "react";
import { BD_LOCATIONS } from "@/lib/data/bd-locations";
import { Check, MapPin, Plus } from "lucide-react";

export interface Address {
  id: string; // "new" for unsaved
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  division: string;
  district: string;
  thana: string;
  zip: string;
  label?: string; // Home, Office
  saveAddress?: boolean; // For new address checkbox
  isEdited?: boolean;
}

interface AddressManagerProps {
  savedAddresses: any[];
  onSelectAddress: (address: Address) => void;
  defaultPhone?: string;
  userFirstName?: string;
  userLastName?: string;
}

export function AddressManager({
  savedAddresses,
  onSelectAddress,
  defaultPhone = "",
  userFirstName = "",
  userLastName = "",
}: AddressManagerProps) {
  const [mode, setMode] = useState<"saved" | "new" | "edit">(
    savedAddresses.length > 0 ? "saved" : "new",
  );
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(
    savedAddresses.length > 0 ? savedAddresses[0].id : null,
  );

  // New/Edit Address Form State
  const [addressForm, setAddressForm] = useState<Address>({
    id: "new",
    firstName: userFirstName,
    lastName: userLastName,
    phone: defaultPhone,
    address: "",
    division: "",
    district: "",
    thana: "",
    zip: "",
    label: "Home",
    saveAddress: true,
    isEdited: false,
  });

  // Derived Dropdown Options
  const divisions = Object.keys(BD_LOCATIONS);
  const districts = addressForm.division
    ? Object.keys(BD_LOCATIONS[addressForm.division] || {})
    : [];
  const thanas =
    addressForm.division && addressForm.district
      ? BD_LOCATIONS[addressForm.division][addressForm.district] || []
      : [];

  // Initialize Edit Mode
  const handleEdit = (addr: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddressForm({
      id: addr.id,
      firstName: addr.firstName || userFirstName,
      lastName: addr.lastName || userLastName,
      phone: addr.phone || defaultPhone,
      address: addr.address || addr.addressLine,
      division: addr.division || addr.city,
      district: addr.district,
      thana: addr.thana,
      zip: addr.postalCode || addr.zip,
      label: addr.label,
      saveAddress: false, // Editing implies saving to DB immediately
      isEdited: true,
    });
    setMode("edit");
  };

  // Effect: Propagate changes to parent
  useEffect(() => {
    if (mode === "saved" && selectedSavedId) {
      const saved = savedAddresses.find((a) => a.id === selectedSavedId);
      if (saved) {
        onSelectAddress({
          ...saved,
          id: saved.id,
          address: saved.address || saved.addressLine,
          division: saved.division || saved.city,
          district: saved.district,
          thana: saved.thana,
          zip: saved.postalCode || saved.zip,
          isEdited: false,
        });
      }
    } else if (mode === "new" || mode === "edit") {
      onSelectAddress(addressForm);
    }
  }, [mode, selectedSavedId, addressForm, savedAddresses]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "division") {
      setAddressForm((prev) => ({
        ...prev,
        division: value,
        district: "",
        thana: "",
      }));
    } else if (name === "district") {
      setAddressForm((prev) => ({ ...prev, district: value, thana: "" }));
    } else {
      setAddressForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Mode Selection (if saved addresses exist) */}
      {savedAddresses.length > 0 && mode !== "edit" && (
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMode("saved")}
            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
              mode === "saved"
                ? "border-primary bg-primary text-white"
                : "border-primary/20 hover:border-primary/50 text-secondary"
            }`}
          >
            Saved Address
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
              mode === "new"
                ? "border-primary bg-primary text-white"
                : "border-primary/20 hover:border-primary/50 text-secondary"
            }`}
          >
            + Add New
          </button>
        </div>
      )}

      {/* 2. Saved Addresses List */}
      {mode === "saved" && (
        <div className="grid grid-cols-1 gap-4">
          {savedAddresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => setSelectedSavedId(addr.id)}
              className={`cursor-pointer p-4 rounded-lg border relative transition-all group ${
                selectedSavedId === addr.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-primary/10 hover:border-primary/30"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div
                    className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${selectedSavedId === addr.id ? "border-primary" : "border-gray-400"}`}
                  >
                    {selectedSavedId === addr.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1 block">
                      {addr.label || "Address"}
                    </span>
                    <p className="text-sm font-medium text-primary">
                      {addr.address || addr.addressLine}
                    </p>
                    <p className="text-xs text-secondary mt-1">
                      {addr.district}, {addr.division}
                      {addr.zip && ` - ${addr.zip}`}
                    </p>
                    <p className="text-xs text-secondary mt-1">{addr.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleEdit(addr, e)}
                  className="p-2 text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Edit Address"
                >
                  {/* Reuse MapPin as Edit icon for now or import Edit2 if available */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. New / Edit Address Form */}
      {(mode === "new" || mode === "edit") && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {mode === "edit" && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Edit Address
              </h3>
              <button
                type="button"
                onClick={() => setMode("saved")}
                className="text-xs text-red-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <input
                type="text"
                name="firstName"
                required
                placeholder=" "
                value={addressForm.firstName}
                onChange={handleFormChange}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-transparent"
              />
              <label className="absolute left-0 top-3 text-secondary/60 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-accent-gold peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold cursor-text">
                First Name <span className="text-red-400">*</span>
              </label>
            </div>
            <div className="group relative">
              <input
                type="tel"
                name="phone"
                required
                placeholder=" "
                value={addressForm.phone}
                onChange={handleFormChange}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-transparent"
              />
              <label className="absolute left-0 top-3 text-secondary/60 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-accent-gold peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold cursor-text">
                Phone Number <span className="text-red-400">*</span>
              </label>
            </div>
          </div>

          {/* Cascading Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Division */}
            <div className="group relative">
              <select
                name="division"
                value={addressForm.division}
                onChange={handleFormChange}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
              <label className="absolute left-0 -top-2 text-[10px] text-accent-gold">
                Division *
              </label>
            </div>

            {/* District */}
            <div className="group relative">
              <select
                name="district"
                value={addressForm.district}
                onChange={handleFormChange}
                disabled={!addressForm.division}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">Select District</option>
                {districts.map((dis) => (
                  <option key={dis} value={dis}>
                    {dis}
                  </option>
                ))}
              </select>
              <label className="absolute left-0 -top-2 text-[10px] text-accent-gold">
                District *
              </label>
            </div>

            {/* Thana */}
            <div className="group relative">
              <select
                name="thana"
                value={addressForm.thana}
                onChange={handleFormChange}
                disabled={!addressForm.district}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="">Select Thana</option>
                {thanas.map((th) => (
                  <option key={th} value={th}>
                    {th}
                  </option>
                ))}
              </select>
              <label className="absolute left-0 -top-2 text-[10px] text-accent-gold">
                Thana *
              </label>
            </div>
          </div>

          {/* Address Line */}
          <div className="group relative">
            <input
              type="text"
              name="address"
              required
              placeholder=" "
              value={addressForm.address}
              onChange={handleFormChange}
              className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-transparent"
            />
            <label className="absolute left-0 top-3 text-secondary/60 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-accent-gold peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold cursor-text">
              House / Road / Block / Flat{" "}
              <span className="text-red-400">*</span>
            </label>
          </div>

          {/* Zip & Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative">
              <input
                type="text"
                name="zip"
                placeholder=" "
                value={addressForm.zip}
                onChange={handleFormChange}
                className="peer w-full bg-transparent border-b border-primary/20 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-transparent"
              />
              <label className="absolute left-0 top-3 text-secondary/60 text-xs transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-[10px] peer-focus:text-accent-gold peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-accent-gold cursor-text">
                Postal Code
              </label>
            </div>
            {mode === "new" && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={addressForm.saveAddress}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      saveAddress: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="saveAddress"
                  className="text-sm text-secondary cursor-pointer select-none"
                >
                  Save this address for future
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
