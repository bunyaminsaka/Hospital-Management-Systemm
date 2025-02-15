import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

export function TokenDebug() {
    const { user, isAuthenticated } = useAuth();
    const token = localStorage.getItem('token');
    let decodedToken = null;
    
    try {
        if (token) {
            decodedToken = jwtDecode(token);
        }
    } catch (error) {
        console.error('Error decoding token:', error);
    }
    
    return (
        <div style={{ margin: 20, padding: 20, background: '#f5f5f5' }}>
            <h3>Debug Info</h3>
            <pre>
                IsAuthenticated: {JSON.stringify(isAuthenticated)}
                {'\n\n'}
                User from Context: {JSON.stringify(user, null, 2)}
                {'\n\n'}
                Raw Token: {token}
                {'\n\n'}
                Decoded Token: {JSON.stringify(decodedToken, null, 2)}
            </pre>
        </div>
    );
} 