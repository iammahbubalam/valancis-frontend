"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, Check } from "lucide-react";
import { profileAPI, UpdateProfileData } from "@/lib/api/profile";

interface User {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ProfileFormProps {
  user: User;
  onUpdate: () => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [form, setForm] = useState<UpdateProfileData>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await profileAPI.updateProfile(form);
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <Input
        label="First Name"
        value={form.firstName}
        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        placeholder="Enter first name"
      />

      <Input
        label="Last Name"
        value={form.lastName}
        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        placeholder="Enter last name"
      />

      <Input
        label="Phone Number"
        type="tel"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="01XXXXXXXXX"
      />

      {error && <p className="text-sm text-status-error">{error}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : success ? (
          <>
            <Check className="w-4 h-4" /> Saved
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
