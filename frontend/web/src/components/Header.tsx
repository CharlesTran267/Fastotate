import Link from 'next/link';
export default function Header() {
  return (
    <header className="navbar bg-base-300">
      <div className="navbar-start">
        <Link className="btn text-xl text-neutral" href="/">
          Fastotate
        </Link>
      </div>
      <div className="navbar-end">
        <Link className="btn btn-ghost mx-4" href="/login">
          Login
        </Link>
        <Link className="btn btn-ghost" href="/signup">
          Sign Up
        </Link>
      </div>
    </header>
  );
}
