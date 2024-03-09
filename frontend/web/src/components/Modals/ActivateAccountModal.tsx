import { useUserSessionStore } from '@/stores/useUserSessionStore';
import { useState } from 'react';
import { BiSolidHide, BiSolidShow } from 'react-icons/bi';
import { BsBracesAsterisk } from 'react-icons/bs';

type FormData = {
  email: string;
  verification_code: string;
};

export default function ActivateAccountModal() {
  const userSessionActions = useUserSessionStore((state) => state.actions);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    verification_code: '',
  });

  const [formError, setFormError] = useState<FormData>({
    email: '',
    verification_code: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    const response = await userSessionActions.sendActivationEmail(
      formData.email,
    );
    if (response.status === 200) {
      setFormError({ email: '', verification_code: '' });
    } else {
      if (response.message.includes('user')) {
        setFormError({ ...formError, email: response.message });
      } else {
        setFormError({ ...formError, verification_code: response.message });
      }
    }
  };

  const handleActivateAccount = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    const response = await userSessionActions.activateAccount(
      formData.email,
      formData.verification_code,
    );
    if (response.status === 200) {
      setFormError({ email: '', verification_code: '' });
      // Close modal
      const modal = document.getElementById(
        'activate_account_modal',
      ) as HTMLDialogElement;
      if (modal == null) return;
      modal.close();
    } else {
      if (response.message.includes('user')) {
        setFormError({ ...formError, email: response.message });
      } else {
        setFormError({ ...formError, verification_code: response.message });
      }
    }
  };

  return (
    <dialog id="activate_account_modal" className="modal">
      <div className="modal-box">
        <h3 className="mb-2 text-lg font-black">Activate Account</h3>
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
          <div className="modal-action mt-2">
            <button
              type="submit"
              className="btn btn-success mx-2 font-black"
              onClick={handleActivateAccount}
            >
              Activate
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
