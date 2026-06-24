/*
  Clerk appearance — themes the hosted SignIn/SignUp components to the CLARIX
  design system (Electric Teal primary, Deep Navy, rounded, social-first).
  We hide Clerk's own header/footer because AuthShell provides branded ones.
*/
export const clerkAppearance = {
  variables: {
    colorPrimary: "#6d28d9",
    colorText: "#1e293b",
    colorTextSecondary: "#64748b",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1e293b",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "w-full border-0 bg-transparent p-0 shadow-none",
    header: "hidden",
    footer: "hidden",
    socialButtonsBlockButton:
      "border border-[#d7dee8] rounded-xl py-3.5 text-[15px] font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-teal",
    socialButtonsBlockButtonText: "font-semibold",
    dividerRow: "my-5",
    dividerText: "text-xs font-medium text-muted-foreground",
    formFieldLabel: "text-[13px] font-semibold text-slate-600",
    formFieldInput:
      "rounded-xl border-[#d7dee8] py-3 text-[15px] focus:border-teal focus:ring-2 focus:ring-teal/20",
    formButtonPrimary:
      "bg-teal text-white rounded-xl py-3.5 text-[15px] font-bold shadow-[0_8px_22px_rgba(124,79,232,.35)] transition hover:-translate-y-0.5 hover:bg-teal-600 normal-case",
    formFieldInputShowPasswordButton: "text-muted-foreground",
    identityPreviewEditButton: "text-teal-600",
    formResendCodeLink: "text-teal-600",
    otpCodeFieldInput: "border-[#d7dee8] focus:border-teal",
  },
} as const;
