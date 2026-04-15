import Product from './Product';

export default function ProductsList({id, products, onInfo, onEdit, onDelete }){
    if(id){
        const product = products.find(p => p.id === id);
        if(product){
            return <div className='product product--list'><Product key={product.id} product={product} onInfo={onInfo} onEdit={onEdit} onDelete={onDelete}/></div>
        }else{
            return <div className='empty'>Продукт не найден...</div>
        }
    }
    if(products.length <= 0 || !products.length){
        return <div className='empty'>Продуктов пока нет...</div>
    }
    return (
        <div className='product product--list'>
            { products.map(p => (<Product key={p.id} product={p} onInfo={onInfo} onEdit={onEdit} onDelete={onDelete}/>)) }
            { products.map(p => console.log(`ID: ${p.id}`))}
        </div>
    );
}