import { useUserSessionStore } from '@/stores/useUserSessionStore';
import { set } from 'lodash';
import { useState } from 'react';
import { BiSolidHide, BiSolidShow } from 'react-icons/bi';
import { BsBracesAsterisk } from 'react-icons/bs';

type FormData = {
  email: string;
  password: string;
  verification_code: string;
};

export default function ForgotPasswordModal() {
  const userSessionActions = useUserSessionStore((state) => state.actions);
  const [showPassword, setShowPassword] = useState(false);
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    verification_code: '',
  });

  const [formError, setFormError] = useState<FormData>({
    email: '',
    password: '',
    verification_code: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    const response = await userSessionActions.sendForgotPasswordEmail(
      formData.email,
    );
    if (response.status === 200) {
      console.log('Code sent');
    } else {
      console.log('Error sending code');
    }
  };

  const handleChangePassword = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const response = await userSessionActions.changePassword(
      formData.email,
      formData.password,
      formData.verification_code,
    );
    if (response.status === 200) {
      setFormError({ email: '', password: '', verification_code: '' });
      // Close modal
      const modal = document.getElementById(
        'forgot_password_modal',
      ) as HTMLDialogElement;
      if (modal == null) return;
      modal.close();
    } else {
      if (response.message.includes('user')) {
        setFormError({ ...formError, email: response.message });
      } else if (response.message.includes('password')) {
        setFormError({ ...formError, password: response.message });
      } else {
        setFormError({ ...formError, verification_code: response.message });
      }
    }
  };

  return (
    <dialog id="forgot_password_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-black">Forgot Password</h3>
        <form method="dialog" className="flex flex-col">
          <div className="form-control">
            <label className="input input-bordered my-2 flex items-center gap-2 pr-0">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              <input
                type="text"
                className="grow bg-inherit"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
              />
              <button
                type="button"
                className="btn btn-warning m-0 p-1 font-black"
                onClick={handleSendCode}
              >
                Send Code
              </button>
            </label>
            <p className="text-error">{formError.email}</p>
          </div>
          <div className="form-control">
            <label className="input input-bordered my-2 flex items-center gap-2 pr-0">
              <BsBracesAsterisk size={15} className="opacity-70" />
              <input
                type="text"
                className="grow bg-inherit"
                placeholder="Verification Code"
                name="verification_code"
                value={formData.verification_code}
                onChange={handleFormChange}
              />
            </label>
            <p className="text-error">{formError.verification_code}</p>
          </div>
          <div className="form-control">
            <label className="input input-bordered my-2 flex items-center gap-2">
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                className="grow bg-inherit disabled:opacity-50"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
              />
              <button
                type="button"
                className="btn btn-ghost m-0 p-0 opacity-70"
                onClick={handleShowPassword}
              >
                {showPassword ? (
                  <BiSolidShow size={18} />
                ) : (
                  <BiSolidHide size={18} />
                )}
              </button>
            </label>
            <p className="text-error">{formError.password}</p>
          </div>
          <div className="modal-action mt-2">
            <button
              type="submit"
              className="btn btn-success mx-2 font-black"
              onClick={handleChangePassword}
            >
              Change Password
            </button>
            <button type="submit" className="btn btn-error font-black">
              Close
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
