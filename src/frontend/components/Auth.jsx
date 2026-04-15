import '../Pages/style/styles.css';
import React, { useEffect, useState } from 'react';
export default function Auth({ handleAuth }) {
    //<-------- переход на страницу регистрации при необходимости(или сделать её прямо тут через условия)

    const [isReg, setIsReg] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [role, setRole] = useState("user");

    const changeAction = () => {
        if (isReg) {
            setIsReg(false);
        } else {
            setIsReg(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedFirstName = first_name.trim();
        const trimmedLastName = last_name.trim();

        if (!trimmedEmail || !trimmedPassword) {
            if(isReg && (!trimmedFirstName || !trimmedLastName)){
                alert("Заполните пустые поля!");
                return;
            }
            alert("Заполните пустые поля!");
            return;
        }

        const userData = {
            email: trimmedEmail,
            password: trimmedPassword,
        };

        if(isReg){
            userData.first_name = first_name;
            userData.last_name = last_name;
            userData.role = role;
        }

        if(isReg){
            setIsReg(false);
            setEmail("");
            setFirstName("");
            setLastName("");
            setPassword("");
            setRole("user");
        }

        handleAuth({data:userData, isReg: isReg});
    }

    return (
        <div className='auth'>
            <div className='toolbar'>
                <button className="btn btn--primary" onClick={changeAction} disabled={isReg ? true : false}
                    style={{ backgroundColor: isReg ? '#bd6732' : '#ff8c42' }}>Регистрация</button>
                <button className="btn btn--primary" onClick={changeAction} disabled={!isReg ? true : false}
                    style={{ backgroundColor: !isReg ? '#bd6732' : '#ff8c42' }}>Авторизация</button>
            </div>
            <form onSubmit={handleSubmit} className="form">
                {isReg ?
                    <div className='auth-input-group'>
                        <input className='input' onChange={(e) => setEmail(e.target.value)} placeholder='Почта' value={email}/>
                        <input className='input' onChange={(e) => setFirstName(e.target.value)} placeholder='Имя' value={first_name}/>
                        <input className='input' onChange={(e) => setLastName(e.target.value)} placeholder='Фамилия' value={last_name}/>
                        <select onChange={(e) => setRole(e.target.value)} className='input'>
                            <option value={"user"}>Пользователь</option>
                            <option value={"seller"}>Продавец</option>
                            <option value={"admin"}>Администратор</option>
                        </select>
                        <input className='input' onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' value={password}/>
                    </div>
                    :
                    <div className='auth-input-group'>
                        <input className='input' onChange={(e) => setEmail(e.target.value)} placeholder='Почта' value={email}/>
                        <input className='input' onChange={(e) => setPassword(e.target.value)} placeholder='Пароль' value={password}/>
                    </div>
                }
                <button className="btn btn--success" type='submit'>{isReg ? "Зарегистрироваться" : "Авторизоваться"}</button>
            </form>
        </div>
    );
}