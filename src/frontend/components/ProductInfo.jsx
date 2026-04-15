export default function ProductInfo({open, product, onClose}){
    if(!open){
        return;
    }
    return (
        <div className="modal">
            <div className="modal__header">
                <label>Информация о продукте</label>
            </div>
            <div className="product__infoList">
                <label className="product product--id">ID: #{product.id}</label>
                <label className="product product--title">Название: {product.title}</label>
                <label className="product product--infocategory">Категория: {product.category}</label>
                <label className="product product--description">Описание: {product.description}</label>
                <label className="product product--infoprice">Стоимость: {product.price}</label>
            </div>
            <div className="modal__footer">
                <button className="btn btn--primary" onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
}