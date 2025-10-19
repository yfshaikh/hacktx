import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { updateUserProfile, getUserProfile } from '@/lib/api/profile';
import { User, CreditCard, Mail, Hash, Check, AlertCircle, Shield } from 'lucide-react';

function Settings() {
  const { user } = useAuth();
  const [capitalOneId, setCapitalOneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    console.log(user)
    const loadProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const profile = await getUserProfile(user.id);
        if (profile?.capital_one_id) {
          setCapitalOneId(profile.capital_one_id);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateUserProfile(user.id, { capital_one_id: capitalOneId });
      setMessage({ type: 'success', text: 'Capital One ID saved successfully!' });
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save Capital One ID. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const userDisplayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Section */}
      <div className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--toyota-red)] to-[var(--toyota-red-dark)] flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">{userDisplayName}</h1>
              <p className="text-[var(--muted-foreground)] flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email || 'No email'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        
        {/* Capital One Integration Card */}
        <Card className="border border-[var(--border)] shadow-lg overflow-hidden bg-[var(--card)]">
          <div className="bg-gradient-to-r from-[var(--toyota-red)]/5 to-transparent border-b border-[var(--border)]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--toyota-red)]/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[var(--toyota-red)]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[var(--card-foreground)]">Capital One Integration</CardTitle>
                  <CardDescription className="mt-1 text-[var(--muted-foreground)]">
                    Connect your Capital One account to access personalized financing options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6 bg-[var(--card)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="capitalOneId" className="text-base font-semibold flex items-center gap-2 text-[var(--card-foreground)]">
                    <Hash className="w-4 h-4" />
                    Capital One Customer ID
                  </Label>
                  <Input
                    id="capitalOneId"
                    type="text"
                    placeholder="Enter your Capital One ID"
                    value={capitalOneId}
                    onChange={(e) => setCapitalOneId(e.target.value)}
                    className="text-base h-12 bg-[var(--input)] text-[var(--foreground)] border-[var(--border)]"
                  />
                  <p className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    This ID will be used to fetch your personalized loan options and financial data
                  </p>
                </div>

                {/* Security Note */}
                <div className="p-4 rounded-lg bg-[var(--muted)]/20 border border-[var(--border)] flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--card-foreground)] mb-1">Your information is secure</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Your bank information is encrypted and stored securely. We never share your financial data with third parties without your explicit consent.
                    </p>
                  </div>
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-sm font-medium flex items-center gap-3 ${
                      message.type === 'success'
                        ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30'
                        : 'bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/30'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    {message.text}
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={saving || !capitalOneId.trim()}
                  className="h-12 text-base font-semibold px-8 bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-white"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="border border-[var(--border)] shadow-lg overflow-hidden bg-[var(--card)]">
          <div className="bg-gradient-to-r from-[var(--muted)]/30 to-transparent border-b border-[var(--border)]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--card-foreground)]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-[var(--card-foreground)]">Account Information</CardTitle>
                  <CardDescription className="mt-1 text-[var(--muted-foreground)]">Your account details and identifiers</CardDescription>
                </div>
              </div>
            </CardHeader>
          </div>
          <CardContent className="p-6 bg-[var(--card)]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 p-4 rounded-lg bg-[var(--muted)]/20 border border-[var(--border)]">
                <Label className="text-sm font-semibold text-[var(--muted-foreground)] flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <p className="text-base font-medium text-[var(--card-foreground)]">
                  {user?.email || 'Not available'}
                </p>
              </div>
              <div className="space-y-2 p-4 rounded-lg bg-[var(--muted)]/20 border border-[var(--border)]">
                <Label className="text-sm font-semibold text-[var(--muted-foreground)] flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  User ID
                </Label>
                <p className="text-sm font-mono text-[var(--card-foreground)] break-all">
                  {user?.id || 'Not available'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;

