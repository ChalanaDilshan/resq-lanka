import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLE_CONFIGS = {
  citizen: {
    key: 'citizen',
    label: 'Citizen',
    tagline: 'Report & Get Help',
    description: 'Disaster-affected citizen seeking emergency rescue, food, or safe shelter.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700',
    defaultEmail: 'citizen@resqlanka.lk',
    defaultName: 'Kasun Bandara',
  },
  volunteer: {
    key: 'volunteer',
    label: 'Volunteer',
    tagline: 'Join & Support',
    description: 'Community volunteer assisting with relief logistics, search & rescue, and aid distribution.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700',
    defaultEmail: 'volunteer@resqlanka.lk',
    defaultName: 'Saman Kumara',
  },
  coordinator: {
    key: 'coordinator',
    label: 'Coordinator',
    tagline: 'Manage & Coordinate',
    description: 'Disaster coordinator / Shelter admin managing supply inventory, needs, and pledges.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    defaultEmail: 'coordinator@resqlanka.lk',
    defaultName: 'Eng. N. Senanayake',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('resq_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRole] = useState(user?.role || 'citizen');

  useEffect(() => {
    if (user) {
      localStorage.setItem('resq_auth_user', JSON.stringify(user));
      setActiveRole(user.role);
    } else {
      localStorage.removeItem('resq_auth_user');
    }
  }, [user]);

  const login = (role = 'citizen', email = '', name = '') => {
    const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.citizen;
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || config.defaultName,
      email: email || config.defaultEmail,
      role: config.key,
      roleLabel: config.label,
      district: 'Ampara District',
      loginTime: new Date().toISOString(),
    };
    setUser(newUser);
    setActiveRole(config.key);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setActiveRole('citizen');
  };

  const switchRole = (newRole) => {
    if (ROLE_CONFIGS[newRole]) {
      login(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        activeRole,
        roleConfig: ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.citizen,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
