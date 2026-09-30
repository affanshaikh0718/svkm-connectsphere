export const SVKM_ALLOWED_DOMAINS = [
  'nmims.edu',
  'mpstme.nmims.edu',
  'student.nmims.edu',
  'djsce.ac.in',
  'mithibai.ac.in',
  'nmcollege.in',
  'pgcl.ac.in',
  'jccl.ac.in',
  'upgcm.ac.in',
  'bncp.ac.in',
  'sbmp.ac.in',
  'svkm.ac.in',
  'alumni.svkm.ac.in',
] as const;

export function isSvkmEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf('@');
  if (atIndex === -1 || atIndex === normalized.length - 1) return false;

  const domain = normalized.slice(atIndex + 1);

  return SVKM_ALLOWED_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

export function getSvkmDomainError(): string {
  return 'Registration is restricted to official SVKM institutions (@nmims.edu, @mpstme.nmims.edu, @djsce.ac.in, @student.nmims.edu, @mithibai.ac.in, @nmcollege.in, @pgcl.ac.in, @jccl.ac.in, @upgcm.ac.in, @bncp.ac.in, @sbmp.ac.in, @svkm.ac.in).';
}
