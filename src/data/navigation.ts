export interface Framework {
    name: string;
    displayName: string;
    path: string;
    color: string;
}

export const frameworks: Framework[] = [
    { name: 'home', displayName: 'Home', path: '/', color: '#61DAFB' },
    { name: 'services', displayName: 'Services', path: '/services', color: '#FF5D01' },
    { name: 'project', displayName: 'Projects', path: '/projects', color: '#61DAFB' },
    { name: 'pricing', displayName: 'Pricing', path: '/pricing', color: '#FF3E00' },

];

// { name: 'process', displayName: 'Process', path: '/process', color: '#4FC08D' },
// { name: 'about', displayName: 'About', path: '/about', color: '#2C4F7C' },