import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignupData } from "@/pages/ShopperSignup";
import { toast } from "sonner";

type AccountCreationStepProps = {
  data: SignupData;
  onUpdate: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
  isExistingUser?: boolean;
};

const AccountCreationStep = ({ data, onUpdate, onNext, onBack, isExistingUser = false }: AccountCreationStepProps) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For existing users, only require age verification (already done)
    if (isExistingUser) {
      onNext();
      return;
    }
    
    // For new users, require all fields
    if (!data.fullName || !data.email || !data.password || !data.ageVerified) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate passwords match
    if (data.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {isExistingUser ? "Update Your Profile" : "Create Your Account"}
        </h2>
        <p className="text-muted-foreground">
          {isExistingUser 
            ? "You can optionally update your name before continuing" 
            : "Tell us a bit about yourself"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name {isExistingUser && "(optional - leave as is if you don't want to change)"}
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder={isExistingUser ? data.fullName || "Current name" : "John Doe"}
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            required={!isExistingUser}
          />
        </div>

        {!isExistingUser && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (minimum 6 characters)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={data.password}
                onChange={(e) => onUpdate({ password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ageVerified"
                checked={data.ageVerified}
                onCheckedChange={(checked) => onUpdate({ ageVerified: checked as boolean })}
                required
              />
              <Label htmlFor="ageVerified" className="font-normal cursor-pointer">
                I am 18 years or older
              </Label>
            </div>
          </>
        )}

        {isExistingUser && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You're already verified with email: <strong>{data.email}</strong>
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Next
        </Button>
      </div>
    </form>
  );
};

export default AccountCreationStep;
