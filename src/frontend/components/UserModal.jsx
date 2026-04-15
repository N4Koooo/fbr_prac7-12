import React, { useEffect, useState } from 'react';
export default function UserModal({ user, open, onSubmit, onClose }) {
    const [email, setEmail] = useState("");
    const [first_name, setFirst_Name] = useState("");
    const [last_name, setLast_Name] = useState("");

    useEffect(() => {
        if (!open) return;

        setEmail(user?.email ?? "");
        setFirst_Name(user?.first_name ?? "");
        setLast_Name(user?.last_name ?? "");
    }, [open, user]);

    if (!open) return;

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedFirst_Name = first_name.trim();
        const trimmedLast_Name = last_name.trim();

        if (!trimmedEmail || !trimmedFirst_Name || !trimmedLast_Name){
            alert('Проверьте корректность введённых данных и повторите попытку!');
            return;
        }

        const userData = {
            id: user.id,
            email: trimmedEmail,
            first_name: trimmedFirst_Name,
            last_name: trimmedLast_Name
        };

        onSubmit(userData);
        onClose();
    };

    return (
        <div className='modal' role='dialog' aria-modal='true'>
            <div className='modal__header'>
                <div className='title'>Редактирование пользователя</div>
            </div>
            <form onSubmit={handleSubmit} className='modal-form'>
                <input className='input' placeholder='Почта' value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className='input' placeholder='Имя' value={first_name} onChange={(e) => setFirst_Name(e.target.value)} />
                <input className='input' placeholder='Фамилия' value={last_name} onChange={(e) => setLast_Name(e.target.value)} />
                <div className='modal__footer'>
                    <button className='btn btn--success' type='submit'>
                        Сохранить
                    </button>
                    <button className='btn btn--danger' onClick={onClose} type='button'>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}