import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SignupData } from "@/pages/ShopperSignup";

type AccountCreationStepProps = {
  data: SignupData;
  onUpdate: (data: Partial<SignupData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const AccountCreationStep = ({ data, onUpdate, onNext, onBack }: AccountCreationStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.fullName || !data.email || !data.password || !data.ageVerified) {
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-muted-foreground">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
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
      </div>

      <div className="flex gap-3 justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={!data.fullName || !data.email || !data.password || !data.ageVerified}>
          Next
        </Button>
      </div>
    </form>
  );
};

export default AccountCreationStep;
