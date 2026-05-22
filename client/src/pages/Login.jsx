import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { HiPhone, HiArrowRight, HiArrowLeft, HiCheckCircle, HiPhone as HiPhoneAlt } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = { PHONE: 1, OTP: 2, SUCCESS: 3 };

export default function Login() {
  const [step, setStep]       = useState(STEPS.PHONE);
  const [phone, setPhone]     = useState('');
  const [name, setName]       = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [isNew, setIsNew]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [devOTP, setDevOTP]   = useState('');
  const { sendOTP, verifyOTP, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) { navigate('/products'); return null; }

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOTP(phone, name);
      // Existing users are logged in directly without OTP.
      if (res.requiresOTP === false) {
        setIsNew(false);
        setStep(STEPS.SUCCESS);
        setTimeout(() => navigate('/products'), 1200);
        return;
      }

      setIsNew(res.purpose === 'register');
      if (res.devOTP) setDevOTP(res.devOTP);
      toast.success(`OTP sent to your WhatsApp +91 ${phone}`);
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPInput = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { toast.error('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await verifyOTP(phone, otpStr, name);
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/products'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nio-cream px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-nio-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Green top banner */}
          <div className="tea-gradient px-8 py-8 text-center">
            <div className="w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-white/60 shadow-xl mb-4">
              <img
                src="/nio-tea-logo.jpg"
                alt="Nio Tea"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-white/20', 'flex', 'items-center', 'justify-center');
                }}
              />
            </div>
            <p className="text-nio-green-200 text-sm mt-1">
              {step === STEPS.PHONE ? 'Sign in to unlock prices' :
               step === STEPS.OTP ? 'Check WhatsApp for your code' :
               'Welcome to Nio Tea!'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Phone */}
            {step === STEPS.PHONE && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-8 py-8"
              >
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="label">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="input-field pl-14"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">We'll send a 6-digit OTP to your <span className="font-medium text-green-600">WhatsApp</span> number.</p>
                  </div>

                  {/* Show name field only for new users (detected after first OTP attempt) */}
                  <div>
                    <label className="label">Your Name <span className="text-gray-400 font-normal">(for new users)</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Arjun Mehta"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">Existing users can leave this blank.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Please wait...' : 'Continue'} <HiArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                  By continuing, you agree to our{' '}
                  <Link to="/contact" className="text-nio-green-700 hover:underline">Terms of Service</Link>
                </p>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Questions?{' '}
                  <a
                    href="https://wa.me/918080649317?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Nio%20Tea."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Chat with Madhuraj →
                  </a>
                </p>
              </motion.div>
            )}

            {/* Step 2: OTP */}
            {step === STEPS.OTP && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-8 py-8"
              >
                <p className="text-sm text-gray-500 mb-6 text-center">
                  OTP sent to your WhatsApp <span className="font-semibold text-nio-green-800">+91 {phone}</span>
                </p>

                {devOTP && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mb-5 text-center">
                    🛠 Dev Mode — OTP: <span className="font-mono font-bold text-base">{devOTP}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                  <div className="flex justify-center gap-2.5 mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOTPInput(e.target.value, i)}
                        onKeyDown={(e) => handleOTPKeyDown(e, i)}
                        className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-nio-green-600 border-gray-200 bg-nio-cream"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="btn-primary w-full disabled:opacity-50 mb-4"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(STEPS.PHONE); setOtp(['','','','','','']); }}
                    className="flex items-center gap-1 mx-auto text-nio-green-700 text-sm hover:underline"
                  >
                    <HiArrowLeft className="w-3.5 h-3.5" /> Change Number
                  </button>
                </form>

                {/* Seller contact card */}
                <div className="mt-6 border-t border-gray-100 pt-5">
                  <p className="text-xs text-gray-400 text-center mb-3">Need help placing an order? Reach out directly</p>
                  <div className="bg-nio-cream rounded-2xl px-4 py-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full tea-gradient flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">MC</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-nio-green-900 text-sm leading-tight">Madhuraj Chhajed</p>
                      <p className="text-xs text-gray-500 mt-0.5">Nio Tea · Direct Seller</p>
                      <p className="text-xs text-nio-green-700 font-medium mt-0.5">+91 80806 49317</p>
                    </div>
                    <a
                      href="https://wa.me/918080649317?text=Hi%20Madhuraj%2C%20I%20need%20help%20with%20my%20Nio%20Tea%20order."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === STEPS.SUCCESS && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-8 py-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <HiCheckCircle className="w-20 h-20 text-nio-green-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-serif font-bold text-2xl text-nio-green-900 mb-2">
                  {isNew ? 'Welcome to Nio Tea!' : 'Welcome back!'}
                </h3>
                <p className="text-gray-500 text-sm">Redirecting to products...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-nio-green-700 transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
