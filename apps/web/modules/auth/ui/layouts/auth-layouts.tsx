export const AuthLayout = ({ children } : {children: React.ReactNode }) => {
  return (
    <div className="auth-aurora min-h-screen min-w-screen flex flex-col items-center justify-center bg-background">
      {children}
    </div>
  );
}
