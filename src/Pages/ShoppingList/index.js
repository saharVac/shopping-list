import React, { useEffect } from 'react'
import Item from '../../Components/Item'
import './style.css'



function ShoppingListPage({ updateItemQuantity, updateItemIsToGet, toGetItems, inStockItems, refreshList, addShoppingItem, addInStockItem, edit }) {

    useEffect(() => {
        refreshList()
    }, [])

    return (
        <div className="page">

            <h1 className="title">Shopping List</h1>

            <button
                className="add-item-btn add-shopping-item-btn"
                onClick={() => addShoppingItem()}
            >
                + Add item
            </button>

            <ul className="shopping-list">
                {
                    toGetItems.map(item => <Item
                        editItem={() => edit("Shopping List", "Editing", item.itemName, item.quantity, item.units, item._id)}
                        updateItemIsToGet={updateItemIsToGet}
                        updateItemQuantity={updateItemQuantity}
                        id={item._id} isToGet={item.isToGet}
                        key={item._id} name={item.itemName}
                        quantity={item.quantity}
                        units={item.units}
                    />)
                }
            </ul>

            <h1 className="title">In Stock</h1>

            <button
                className="add-item-btn add-in-stock-item-btn"
                onClick={() => addInStockItem()}
            >
                + Add item
            </button>

            <ul className="in-stock-list">
                {
                    inStockItems.map(item => <Item
                        editItem={() => edit("In Stock", "Editing", item.itemName, item.quantity, item.units, item._id)}
                        updateItemIsToGet={updateItemIsToGet}
                        updateItemQuantity={updateItemQuantity}
                        id={item._id} isToGet={item.isToGet}
                        key={item._id}
                        name={item.itemName}
                        quantity={item.quantity}
                        units={item.units}
                    />)
                }
            </ul>

        </div>
    )
}

export default ShoppingListPage
