import { INITIAL_PATIENTS, INITIAL_CUSTOMERS, Patient, Customer } from './mock-data';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'customer';
  dob?: string;
  primary_doctor?: string;
  avatar?: string;
  google_id?: string;
  token: string;
  created_at: string;
}

// In-memory user store initialized with demo accounts
let registeredUsers: UserSession[] = [
  {
    id: 'PAT-2001',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    role: 'patient',
    dob: '1985-12-10',
    primary_doctor: 'Dr. Sarah Jenkins (Cardiology)',
    token: 'jwt-token-pat-2001-ada',
    created_at: '2025-05-10T09:00:00Z',
  },
  {
    id: 'PAT-2002',
    name: 'Alan Turing',
    email: 'alan@example.com',
    role: 'patient',
    dob: '1982-06-23',
    primary_doctor: 'Dr. Marcus Vance (Neurology)',
    token: 'jwt-token-pat-2002-alan',
    created_at: '2025-06-15T10:30:00Z',
  },
  {
    id: 'DOC-3001',
    name: 'Dr. Sarah Jenkins',
    email: 'dr.jenkins@example.com',
    role: 'doctor',
    token: 'jwt-token-doc-3001-jenkins',
    created_at: '2024-01-01T08:00:00Z',
  },
  {
    id: 'ADMIN-100',
    name: 'Clinic Administrator',
    email: 'admin@example.com',
    role: 'admin',
    token: 'jwt-token-admin-100',
    created_at: '2024-01-01T08:00:00Z',
  },
];

/**
 * Generates a simple mock JWT token for session management.
 */
function createMockJWT(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: userId, email, exp: Date.now() + 86400000 * 7 }));
  const signature = btoa(`sig-${userId}-${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

export function getAllUsersStore(): UserSession[] {
  return registeredUsers;
}

export function findUserByEmail(email: string): UserSession | undefined {
  return registeredUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): UserSession | undefined {
  return registeredUsers.find((u) => u.id === id);
}

export function findUserByToken(token: string): UserSession | undefined {
  return registeredUsers.find((u) => u.token === token);
}

export function registerNewPatient(data: {
  name: string;
  email: string;
  password?: string;
  dob?: string;
  primary_doctor?: string;
}): UserSession {
  const existing = findUserByEmail(data.email);
  if (existing) {
    return existing;
  }

  const newId = `PAT-${2000 + registeredUsers.length + 1}`;
  const token = createMockJWT(newId, data.email);

  const newUser: UserSession = {
    id: newId,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    role: 'patient',
    dob: data.dob || '1990-01-01',
    primary_doctor: data.primary_doctor || 'Dr. Sarah Jenkins (Cardiology)',
    token,
    created_at: new Date().toISOString(),
  };

  registeredUsers.push(newUser);

  // Sync with INITIAL_PATIENTS array
  INITIAL_PATIENTS.push({
    patient_id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    dob: newUser.dob || '1990-01-01',
    primary_doctor: newUser.primary_doctor || 'Dr. Sarah Jenkins (Cardiology)',
    created_at: newUser.created_at,
  });

  return newUser;
}

export function authenticateUser(email: string): UserSession | null {
  const user = findUserByEmail(email);
  if (user) return user;

  // Auto-provision if demo user
  const demoPatient = INITIAL_PATIENTS.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (demoPatient) {
    const token = createMockJWT(demoPatient.patient_id, demoPatient.email);
    const newUser: UserSession = {
      id: demoPatient.patient_id,
      name: demoPatient.name,
      email: demoPatient.email,
      role: 'patient',
      dob: demoPatient.dob,
      primary_doctor: demoPatient.primary_doctor,
      token,
      created_at: demoPatient.created_at,
    };
    registeredUsers.push(newUser);
    return newUser;
  }

  return null;
}

/**
 * Provisions or authenticates a patient account via Google OAuth Single Sign-On (SSO).
 */
export function authenticateWithGoogle(googleProfile: {
  name: string;
  email: string;
  google_id?: string;
  avatar?: string;
}): UserSession {
  let existing = findUserByEmail(googleProfile.email);
  if (existing) {
    existing.google_id = googleProfile.google_id || `google-id-${Date.now()}`;
    if (googleProfile.avatar) existing.avatar = googleProfile.avatar;
    return existing;
  }

  const newId = `PAT-${2000 + registeredUsers.length + 1}`;
  const token = createMockJWT(newId, googleProfile.email);

  const newUser: UserSession = {
    id: newId,
    name: googleProfile.name.trim(),
    email: googleProfile.email.trim().toLowerCase(),
    role: 'patient',
    dob: '1992-08-14',
    primary_doctor: 'Dr. Sarah Jenkins (Cardiology)',
    avatar: googleProfile.avatar,
    google_id: googleProfile.google_id || `google-${Date.now()}`,
    token,
    created_at: new Date().toISOString(),
  };

  registeredUsers.push(newUser);

  INITIAL_PATIENTS.push({
    patient_id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    dob: newUser.dob || '1992-08-14',
    primary_doctor: newUser.primary_doctor || 'Dr. Sarah Jenkins (Cardiology)',
    created_at: newUser.created_at,
  });

  return newUser;
}
