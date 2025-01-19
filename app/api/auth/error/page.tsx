// app/auth/error/page.tsx

export default function AuthErrorPage() {
  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Authentication Error</h1>
      <p className="text-center">There was an issue with your login attempt. Please try again later or contact support.</p>
    </div>
  );
}
