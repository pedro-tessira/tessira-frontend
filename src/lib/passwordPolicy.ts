export const PASSWORD_POLICY_MIN_LENGTH = 12;

export const getPasswordPolicyIssues = (password: string): string[] => {
  const issues: string[] = [];
  if (password.length < PASSWORD_POLICY_MIN_LENGTH) {
    issues.push(`At least ${PASSWORD_POLICY_MIN_LENGTH} characters`);
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("1 uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    issues.push("1 lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    issues.push("1 number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push("1 symbol");
  }
  return issues;
};

export const isPasswordPolicyValid = (password: string): boolean =>
  getPasswordPolicyIssues(password).length === 0;
