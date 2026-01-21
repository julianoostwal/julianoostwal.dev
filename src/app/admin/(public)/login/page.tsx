import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Admin Login
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

