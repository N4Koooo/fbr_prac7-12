import React, { useEffect, useState } from 'react';

export default function ProductModal({ open, mode, product, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    //title, category, description, price

    useEffect(() => {
        if (!open) return;

        setTitle(product?.title ?? "");
        setCategory(product?.category ?? "");
        setDescription(product?.description ?? "");
        setPrice(product?.price != null ? String(product.price) : "");
    }, [open, product]);

    if (!open) return;

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);

        if (!trimmedTitle || !trimmedCategory || !trimmedDescription || !Number.isFinite(parsedPrice)) {
            alert('Проверьте корректность введённых данных и повторите попытку!');
            return;
        }

        const productData = {
            title: trimmedTitle,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice
        };

        if (mode === 'edit') {
            productData.id = product.id;
        }

        onSubmit(productData);
        onClose();
    };

    return (
        <div className='modal' role='dialog' aria-modal='true'>
            <div className='modal__header'>
                <div className='title'>{mode === 'edit' ? "Редактирование продукта" : "Создание продукта"}</div>
            </div>
            <form onSubmit={handleSubmit} className='modal-form'>
                <input className='input' placeholder='Название' value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className='input' placeholder='Категория' value={category} onChange={(e) => setCategory(e.target.value)} />
                <input className='input' placeholder='Описание' value={description} onChange={(e) => setDescription(e.target.value)} />
                <input className='input' placeholder='Стоимость' value={price} onChange={(e) => setPrice(e.target.value)} />
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