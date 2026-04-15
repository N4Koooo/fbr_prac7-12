import { useEffect, useState } from 'react';
import { api } from '../api';
import './style/styles.scss';
import Auth from "../components/Auth";
import ProductModal from "../components/ProductModal";
import ProductsList from "../components/ProductsList";
import ProductInfo from "../components/ProductInfo";
import UserModal from '../components/UserModal';
import UsersList from '../components/UsersList';

export default function MainPage() {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [infoOpen, setInfoOpen] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [productId, setProductId] = useState(""); // selected product
    const [userId, setUserId] = useState(""); // selected user
    const [page, setPage] = useState("auth"); // auth | main | users

    useEffect(() => {
        const authTry = async () => {
            let token = localStorage.getItem('access_token');
            if (token) {
                setLoading(true);
                try {
                    let userData = await api.GetMe();
                    setUser(userData);
                    setIsAuth(true);
                    setPage('main');
                    await loadProducts();
                    if (userData.role === 'admin') {
                        let usersData = await loadUsers();
                        setUsers(usersData);
                    }
                } catch (err) {
                    console.log(err);
                } finally {
                    setLoading(false);
                }
            }
        };

        authTry();
    }, []);

    const handleAuth = async (userData) => {
        if (userData.isReg) {
            console.log(`Попытка регистрации user: ${userData.data}`);
            try {
                let result = await api.Registration(userData.data);
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('refresh_token', result.refresh_token);
                setUser(result.user);
                setIsAuth(true);
                setPage('main');
                await loadProducts();
                if (userData.role === 'admin') {
                    let usersData = await loadUsers();
                    setUsers(usersData);
                }
            } catch (err) {
                console.error(err);
                alert("Ошибка регистрации!");
            }
        } else {
            console.log(`Попытка авторизации user: ${userData.data}`);
            try {
                let result = await api.Login(userData.data);
                localStorage.setItem('access_token', result.access_token);
                localStorage.setItem('refresh_token', result.refresh_token);
                const user = await api.GetMe();
                setUser(user);
                setIsAuth(true);
                setPage('main');
                loadProducts();
                if (userData.role === 'admin') {
                    let usersData = await loadUsers();
                    setUsers(usersData);
                }
            } catch (err) {
                console.error(err);
                alert("Ошибка авторизации!");
                setIsAuth(false);
                setPage('auth');
            }
        }
    };

    const handleQuit = () => {
        setIsAuth(false);
        setPage('auth');
        setProducts([]);
        setProductId("");
        setUser(null);
        setUsers([]);
        closeInfo();
        closeModal();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    const loadProducts = async () => {
        try {
            console.log("[FRONT]: Список продуктов запрошен!");
            setLoading(true);
            const data = await api.GetProducts();
            setProducts(data);
            console.log("[FRONT]: Список продуктов получен!");
            console.log(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки продуктов!");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            console.log("[FRONT]: Список пользователей запрошен!");
            const data = await api.GetUsers();
            console.log("[FRONT]: Список пользователей получен!");
            console.log(data);
            setUsers(data);
            return data;
        } catch (err) {
            console.log(err);
        }
    }

    const openCreate = () => {
        setModalMode('create');
        setModalOpen(true);
        setEditingProduct(null);
    };

    const openEdit = (product) => {
        setModalMode('edit');
        setModalOpen(true);
        setEditingProduct(product);
    };

    const openInfo = (product) => {
        setInfoOpen(true);
        setEditingProduct(product);
    };

    const closeInfo = () => {
        setInfoOpen(false);
        setEditingProduct(null);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const openUserModal = (user) => {
        setUserModalOpen(true);
        setEditingUser(user);
    };

    const closeUserModal = () => {
        setUserModalOpen(false);
        setEditingUser(null);
    };

    const handleUserSubmit = async (updatedUser) => {
        try{
            let result = await api.UpdateUser(updatedUser);
            setUsers((prev) => prev.map((u) => u.id === result.id ? result : u));
        }catch(err){
            console.log(err);
            alert("Ошибка обновления пользователя!");
        }finally{
            closeUserModal();
        }
    };

    const handleBan = async (user) => {
        try{
            await api.BanUser(user.id);
            setUsers((prev) => prev.map((u) => u.id === user.id ? {...u, isBanned: !u.isBanned } : u));
        }catch(err){
            console.log(err);
            alert("Ошибка блокировки пользователя!");
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить продуктв?");
        if (!ok) {
            console.log("Отмена удаления продукта #", id);
            return;
        }

        try {
            await api.DeleteProduct(id);
            setProducts((prev) => prev.filter(p => p.id !== id));
        } catch (err) {
            console.log(err);
            alert("Ошибка удаления продукта!");
        }
    };

    const handleSubmit = async (newProduct) => {
        try {
            if (modalMode === 'create') {
                var new_product = await api.CreateProduct(newProduct);
                setProducts((prev) => [...prev, new_product]);
            } else {
                var updated_product = await api.UpdateProduct(newProduct);
                setProducts((prev) => prev.map((p) => p.id === newProduct.id ? updated_product : p));
            }
        } catch (err) {
            console.error(err);
            alert('Ошибка сохранения продутка!');
        } finally {
            closeModal();
        }
    };

    return (
        //AUTH registration INFO MODAL!!!!! СДЕЛАТЬ РЕГИСТРАЦИЮ!!!
        <div className='screen'>
            <header className='header'>
                <p className='header__title'>Products</p>
                {isAuth && <button className='btn btn--primary' onClick={() => setPage('main')}>Главная страница</button>}
                {isAuth && user.role === 'admin' && <button className='btn btn--primary' onClick={async () => {setPage('users'); await loadUsers();}}>Пользователи</button>}
                {isAuth && <button className='btn btn--danger' onClick={handleQuit}>Выйти</button>}
            </header>
            {page === 'auth' ?
                (<Auth handleAuth={handleAuth} />)
                :
                page === 'main' ?
                    (<div className='mainpage'>
                        <main className='main'>
                            <div className='products_list'>
                                <div className='toolbar'>
                                    <h1 className='title'>Продукты</h1>
                                    <input className='input' placeholder='Айди продукта' onChange={(e) => setProductId(e.target.value)} />
                                    <button className='btn btn--primary' onClick={openCreate}>Создать</button>
                                </div>
                                {
                                    loading ? (<div className='empty'>Загрузка...</div>) : (<ProductsList id={productId} products={products} onInfo={openInfo} onEdit={openEdit} onDelete={handleDelete} />)
                                }
                            </div>
                        </main>
                        <ProductModal open={modalOpen} mode={modalMode} product={editingProduct} onClose={closeModal} onSubmit={handleSubmit} />
                        <ProductInfo open={infoOpen} product={editingProduct} onClose={closeInfo} />
                    </div>)
                    :
                    <div className='mainpage'>
                        <main className='main'>
                            <div className='products_list'>
                                <div className='toolbar'>
                                    <h1 className='title'>Пользователи</h1>
                                    <input className='input' placeholder='Айди пользователя' onChange={(e) => setUserId(e.target.value)} />
                                </div>
                                {
                                    <UsersList id={userId} users={users} onEdit={openUserModal} onBan={handleBan}/>
                                }
                            </div>
                        </main>
                        <UserModal user={editingUser} open={userModalOpen} onSubmit={handleUserSubmit} onClose={closeUserModal}/>
                    </div>
            }
            <footer className='footer'>
                <div>
                    copyright Products System {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    );
}