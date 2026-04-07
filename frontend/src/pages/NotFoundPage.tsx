import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-gray-500">Halaman tidak ditemukan</p>
        <Link to="/dashboard">
            <Button>Kembali ke Dashboard</Button>
        </Link>
    </div>
);