// Authentication helper functions

interface AdminUser {
    id: number;
    email: string;
    name: string;
}

interface Session {
    id: string;
    user_id: number;
    expires_at: string;
}

export async function getSession(cookies: any, db: any): Promise<{ user: AdminUser | null }> {
    const sessionId = cookies.get('session')?.value;

    if (!sessionId || !db) {
        return { user: null };
    }

    try {
        // Get session and check if valid
        const session = await db.prepare(
            "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
        ).bind(sessionId).first<Session>();

        if (!session) {
            return { user: null };
        }

        // Get user
        const user = await db.prepare(
            "SELECT id, email, name FROM admin_users WHERE id = ? AND is_active = 1"
        ).bind(session.user_id).first<AdminUser>();

        return { user: user || null };
    } catch (error) {
        console.error('Session check error:', error);
        return { user: null };
    }
}
