import type { Config } from 'tailwindcss';
export default { darkMode: ['class'], content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#10231d', mint:'#dff7ec', sage:'#8fc9ac', coral:'#ff8066', cream:'#f7fbf8' }, boxShadow: { soft:'0 20px 50px rgba(16,35,29,.08)' } } }, plugins: [] } satisfies Config;
