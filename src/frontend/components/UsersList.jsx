import User from "./User";

export default function UsersList({ id, users, onEdit, onBan }) {
    if (id) {
        const user = users.find(u => u.id === id);
        if (user) {
            return <div className='userslist'><User key={user.id} user={user} onEdit={onEdit} onBan={onBan} /></div>
        } else {
            return <div className='empty'>Пользователь не найден...</div>
        }
    }

    if (!users) {
        return <div className="empty">Список пользователей пуст...</div>
    }
    return (
        <div className="userslist">
            {users.map((u) => <User user={u} onEdit={onEdit} onBan={onBan} />)}
        </div>
    );
}