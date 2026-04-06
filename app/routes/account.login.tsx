import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {login} from '~/lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      navigate('/account');
    } else {
      setError(result.error ?? 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy text-center">Sign In</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-orange px-6 py-3 font-semibold text-white hover:bg-orange/90 transition"
        >
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/account/register" className="text-orange hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
