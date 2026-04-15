export default function Product({product, onInfo, onEdit, onDelete}){
    const infoHandle = () => {
        onInfo(product);
    };

    const editHandle = () => {
        onEdit(product);
    };

    const deleteHandle = () => {
        onDelete(product.id);
    };

    return (
        <div className="product product--card">
            <div className="product product--category">{product.category}</div>
            <div className="product product--title">{product.title}</div>
            <div className="product product--actions">
                <button className="btn btn--info" onClick={infoHandle}>Информация</button>
                <button className="btn btn--warning" onClick={editHandle}>Изменить</button>
                <button className="btn btn--danger" onClick={deleteHandle}>Удалить</button>
            </div>
        </div>
    );
}