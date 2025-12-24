

// Mock implementation: returns a static onboarding plan, no API keys or external calls required
export const generateOnboardingPlan = async (role: string, department: string) => {
  // You can customize this plan as needed for different roles/departments
  return [
    { title: "Initial Setup", description: `Set up email, workstations, and access for the new ${role} in ${department}.` },
    { title: "Team Introduction", description: "Meet the immediate team members and manager." },
    { title: "HR Orientation", description: "Attend HR orientation session and complete paperwork." },
    { title: "Training", description: "Complete required training modules for your role." },
    { title: "First Assignment", description: "Start on your first project or assignment with your team." }
  ];
};
