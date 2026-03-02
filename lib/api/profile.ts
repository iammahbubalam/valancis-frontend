import { getApiUrl } from "@/lib/utils";

// ==========================================
// Types
// ==========================================

export interface Address {
  id: string;
  userId: string;
  label: string;
  contactEmail: string;
  phone: string;
  firstName: string;
  lastName: string;
  deliveryZone: string;
  division: string;
  district: string;
  thana: string;
  addressLine: string;
  landmark: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
}

// ==========================================
// API Client
// ==========================================

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export const profileAPI = {
  // Addresses
  getAddresses: async (): Promise<Address[]> => {
    const res = await fetch(getApiUrl("/user/addresses"), {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch addresses");
    return res.json();
  },

  addAddress: async (data: Partial<Address>): Promise<Address> => {
    const res = await fetch(getApiUrl("/user/addresses"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add address");
    return res.json();
  },

  updateAddress: async (
    id: string,
    data: Partial<Address>,
  ): Promise<Address> => {
    const res = await fetch(getApiUrl(`/user/addresses/${id}`), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update address");
    return res.json();
  },

  deleteAddress: async (id: string): Promise<void> => {
    const res = await fetch(getApiUrl(`/user/addresses/${id}`), {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete address");
  },

  // Profile
  updateProfile: async (data: UpdateProfileData): Promise<any> => {
    const res = await fetch(getApiUrl("/user/profile"), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
  },

  // Orders (Read-only)
  getOrders: async (): Promise<any[]> => {
    const res = await fetch(getApiUrl("/orders"), {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },
};
