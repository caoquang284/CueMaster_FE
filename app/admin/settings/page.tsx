"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function PreferenceToggle({ id, label, description, checked, onChange }: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoReports, setAutoReports] = useState(true);
  const [systemDarkMode, setSystemDarkMode] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceToggle
            id="email-alerts"
            label="Email alerts"
            description="Receive booking confirmations and critical alerts via email."
            checked={emailAlerts}
            onChange={setEmailAlerts}
          />
          <PreferenceToggle
            id="sms-alerts"
            label="SMS alerts"
            description="Send real-time table and payment updates to your phone."
            checked={smsAlerts}
            onChange={setSmsAlerts}
          />
          <PreferenceToggle
            id="auto-reports"
            label="Weekly performance reports"
            description="Automatically export performance reports every Monday at 8 AM."
            checked={autoReports}
            onChange={setAutoReports}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreferenceToggle
            id="auto-dark-mode"
            label="Follow system appearance"
            description="Automatically switch the dashboard theme based on your operating system."
            checked={systemDarkMode}
            onChange={setSystemDarkMode}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save preferences</Button>
      </div>
    </div>
  );
}
