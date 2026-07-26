import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { useApp } from "../context/useApp";
import { setupTwoFactor, enableTwoFactor, disableTwoFactor } from "../api/auth";
import "./TwoFactorSettings.css";

export default function TwoFactorSettings() {
  const { user, setUser, showToast } = useApp();
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(!!user?.twoFactorEnabled);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const response = await setupTwoFactor();
      const payload = response?.data || response;
      setSetupData(payload);
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Couldn't start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnable = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await enableTwoFactor(code.trim());
      setEnabled(true);
      setSetupData(null);
      setCode("");
      const updatedUser = { ...user, twoFactorEnabled: true };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      showToast?.("Two-factor authentication enabled");
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      await disableTwoFactor(code.trim());
      setEnabled(false);
      setCode("");
      const updatedUser = { ...user, twoFactorEnabled: false };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      showToast?.("Two-factor authentication disabled");
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-settings">
      <div className="two-factor-header">
        {enabled ? (
          <ShieldCheck size={20} color="#16a34a" />
        ) : (
          <ShieldOff size={20} color="var(--text-muted)" />
        )}
        <div>
          <strong>Two-Factor Authentication</strong>
          <p>{enabled ? "Enabled" : "Not enabled"}</p>
        </div>
      </div>

      {enabled ? (
        <form onSubmit={handleDisable} className="two-factor-form">
          <p>Enter a current code to disable 2FA.</p>
          <input
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          <button className="btn-outline" type="submit" disabled={loading}>
            {loading ? "Working..." : "Disable 2FA"}
          </button>
        </form>
      ) : setupData ? (
        <form onSubmit={handleConfirmEnable} className="two-factor-form">
          <p>Scan this QR code with your authenticator app, then enter a code to confirm.</p>
          <img
            src={setupData.qrCodeDataUrl}
            alt="2FA QR Code"
            className="two-factor-qr"
          />
          <p className="two-factor-secret">
            Or enter manually: <code>{setupData.secret}</code>
          </p>
          {setupData.backupCodes && (
            <div className="two-factor-backup-codes">
              <p>Save these backup codes somewhere safe:</p>
              <div className="backup-codes-grid">
                {setupData.backupCodes.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Enter code from app"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Confirm & Enable"}
          </button>
        </form>
      ) : (
        <button className="btn-primary" onClick={handleStartSetup} disabled={loading}>
          {loading ? "Loading..." : "Enable 2FA"}
        </button>
      )}
    </div>
  );
}
