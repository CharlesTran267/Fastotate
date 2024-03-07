import Link from 'next/link';
import LoginModal from './LoginModal';
import SignUpModal from './SignUpModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useUserSessionStore } from '@/stores/useUserSessionStore';
import { createProject } from '@/utils/utils';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    const userSessionActions = useUserSessionStore((state) => state.actions);

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
    const session_token = useUserSessionStore((state) => state.session_token);
    const handleLogout = () => {
        userSessionActions.logout();
    };

    const handleCreateProjectClick = async () => {
        const project_id = await createProject(session_token);
        router.push(`/annotation/${project_id}`);
    };

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
                        <button
                            className="btn btn-ghost"
                            onClick={handleCreateProjectClick}
                        >
                            Create Project
                        </button>
                        <div className="flex-none">
                            <ul className="menu menu-horizontal px-1">
                                <li>
                                    <details>
                                        <summary>{user_email}</summary>
                                        <ul className="ml-auto rounded-t-none bg-base-100 p-2">
                                            <li>
                                                <a href="/projects">Projects</a>
                                            </li>
                                            <li>
                                                <button onClick={handleLogout}>
                                                    Log out
                                                </button>
                                            </li>
                                        </ul>
                                    </details>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
