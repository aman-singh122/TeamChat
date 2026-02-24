import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-[#081632]/85 p-4 shadow-softLg">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorBackground: "#0b1738",
            colorText: "#e2e8f0",
            colorTextSecondary: "#94a3b8",
            colorInputBackground: "#102147",
            colorInputText: "#e2e8f0",
            colorPrimary: "#3b82f6",
            borderRadius: "0.95rem",
          },
          elements: {
            rootBox: "w-full",
            card: "shadow-none bg-transparent border-0",
            headerTitle: "text-slate-100",
            headerSubtitle: "text-slate-300",
            formFieldLabel: "text-slate-200",
            formFieldInput:
              "bg-[#102147] border-slate-600 text-slate-100 placeholder:text-slate-400",
            formButtonPrimary: "bg-blue-500 text-white hover:bg-blue-400",
            socialButtonsBlockButton:
              "border-slate-600 bg-[#102147] text-slate-100 hover:bg-[#1a2d5b]",
            dividerLine: "bg-slate-700",
            dividerText: "text-slate-400",
            footerActionText: "text-slate-300",
            footerActionLink: "text-blue-300 hover:text-blue-200",
            identityPreviewText: "text-slate-200",
            identityPreviewEditButton: "text-blue-300 hover:text-blue-200",
          },
        }}
      />
    </div>
  );
}
