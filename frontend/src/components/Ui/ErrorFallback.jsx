import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

function ErrorFallback() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? error.data?.message || error.statusText || 'Something went wrong.'
    : error instanceof Error
      ? error.message
      : 'Unexpected application error.';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--c-bg)] px-4 py-12 text-[var(--c-sub)]">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[var(--c-surface)] p-8 shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--c-accent)]">
          Oops
        </p>
        <h1 className="mb-3 text-3xl font-bold text-[var(--c-ink)]">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm leading-6 text-[var(--c-muted)]">
          The page crashed while rendering. You can refresh or go back home.
        </p>

        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          <p className="font-medium">Details</p>
          <p className="mt-1 break-words">{message}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[var(--c-accent)] px-4 py-2 font-medium text-white transition hover:opacity-90"
          >
            Reload page
          </button>
          <Link
            to="/home"
            className="rounded-lg border border-white/10 px-4 py-2 font-medium text-[var(--c-ink)] transition hover:bg-white/5"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorFallback;
