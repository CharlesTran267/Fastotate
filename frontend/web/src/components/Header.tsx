import Link from 'next/link';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useUserSessionStore } from '@/stores/useUserSessionStore';

export default function Header() {
    const handleLoginClick = () => {
        const modal = document.getElementById(
            'login_modal',
        ) as HTMLDialogElement;
        if (modal == null) return;
        modal.showModal();
    };

    const handleSignUpClick = () => {
        const modal = document.getElementById(
            'signup_modal',
        ) as HTMLDialogElement;
        if (modal == null) return;
        modal.showModal();
    };
    const user_email = useUserSessionStore((state) => state.user_email);

    return (
        <header className="navbar bg-base-300">
            <div className="navbar-start">
                <Link className="btn text-xl text-neutral" href="/">
                    Fastotate
                </Link>
            </div>
            <div className="navbar-end">
                {user_email === null ? (
                    <>
                        <button
                            className="btn btn-ghost mx-4"
                            onClick={handleLoginClick}
                        >
                            Login
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={handleSignUpClick}
                        >
                            Sign Up
                        </button>
                        <LoginModal />
                        <SignUpModal />
                        <ForgotPasswordModal />
                    </>
                ) : (
                    <>
                        <button className="btn btn-ghost">
                            {' '}
                            {user_email}{' '}
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
