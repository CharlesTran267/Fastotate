import { useState } from 'react';
import { BiSolidHide, BiSolidShow } from 'react-icons/bi';
import axios from 'axios';
import { set } from 'lodash';
import { useUserSessionStore } from '@/stores/useUserSessionStore';

type FormData = {
    email: string;
    password: string;
};

export default function LoginModal() {
    const userSessionActions = useUserSessionStore((state) => state.actions);

    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [formErros, setFormErrors] = useState<FormData>({
        email: '',
        password: '',
    });

    const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = (values: FormData) => {
        const errors = {} as any;

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if (!values.email) {
            errors.email = 'Email is required';
        } else if (!regex.test(values.email)) {
            errors.email = 'Invalid email format';
        }
        if (!values.password) {
            errors.password = 'Password is required';
        }
        return errors;
    };

    const handleSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();
        const errors = validateForm(formData);
        if (Object.keys(errors).length === 0) {
            console.log('Form is valid! Submitting...');
            const response = await userSessionActions.login(
                formData.email,
                formData.password,
            );
            if (response?.status !== 200) {
                const message = response.message;
                if (message.includes('password')) {
                    setFormErrors({ ...formErros, password: message });
                } else {
                    setFormErrors({ ...formErros, email: message });
                }
            }
        } else {
            setFormErrors(errors);
        }
    };

    const openForgotPasswordModal = () => {
        const modal = document.getElementById(
            'forgot_password_modal',
        ) as HTMLDialogElement;
        if (modal == null) return;
        // Close current modal
        const login_modal = document.getElementById(
            'login_modal',
        ) as HTMLDialogElement;
        if (login_modal == null) return;
        login_modal.close();
        modal.showModal();
    };

    const openSignUpModal = () => {
        const modal = document.getElementById(
            'signup_modal',
        ) as HTMLDialogElement;
        if (modal == null) return;
        // Close current modal
        const login_modal = document.getElementById(
            'login_modal',
        ) as HTMLDialogElement;
        if (login_modal == null) return;
        login_modal.close();
        modal.showModal();
    };

    return (
        <dialog id="login_modal" className="modal">
            <div className="modal-box">
                <h3 className="mb-2 text-lg font-black">Login</h3>
                <form method="dialog" className="flex flex-col">
                    <div className="form-control">
                        <label className="input input-bordered my-2 flex items-center gap-2">
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
                                onChange={handleFormDataChange}
                            />
                        </label>
                        <p className="text-error">{formErros.email}</p>
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
                                className="grow bg-inherit"
                                placeholder="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleFormDataChange}
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
                        <p className="text-error">{formErros.password}</p>
                    </div>
                    <div className="mt-2 flex flex-col text-xs">
                        <a
                            className="link ml-auto"
                            onClick={openForgotPasswordModal}
                        >
                            Forgot Password?
                        </a>
                        <h2 className="my-2 ml-auto">
                            Don't have an account?{' '}
                            <a className="link" onClick={openSignUpModal}>
                                Create one
                            </a>
                        </h2>
                    </div>
                    <div className="modal-action mt-2">
                        <button
                            type="submit"
                            className="btn btn-success mx-2 font-black"
                            onClick={handleSubmit}
                        >
                            Login
                        </button>
                        <button
                            type="submit"
                            className="btn btn-error font-black"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
