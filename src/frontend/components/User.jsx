export default function User({user, onEdit, onBan}){
    const handleEdit = () => {
        onEdit(user);
    }
    const handleBan = () => {
        onBan(user);
    }
    return ( 
        <div className="user--card">
            <div className="title">{user.id}</div>
            <div className="user--email">{user.email}</div>
            <div className="user--name">{user.first_name} {user.last_name}</div>
            <div className="user--email">{user.role}</div>
            <div className="user--actions">
                <button className="btn btn--warning" onClick={handleEdit}>Изменить</button>
                <button className={user.isBanned ? "btn btn--success" : "btn btn--danger"} onClick={handleBan}>{user.isBanned ? "Разблокировать" : "Заблокировать"}</button>
            </div>
        </div>
    );
}