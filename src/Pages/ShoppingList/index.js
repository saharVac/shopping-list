import React, { useEffect } from 'react'
import Item from '../../Components/Item'
import './style.css'



function ShoppingListPage({ listViewed, updateItemQuantity, updateItemIsToGet, toGetItems, inStockItems, refreshList, addShoppingItem, addInStockItem, edit }) {

    useEffect(() => {
        refreshList()
    }, [])

    const isShoppingList = (listViewed === "Shopping List")
    const listItems = isShoppingList ? toGetItems : inStockItems

    return (
        <div className="page">

            <h1 className="title">{listViewed}</h1>

            <button
                className={`add-item-btn ${isShoppingList ? "add-shopping-item-btn" : "add-in-stock-item-btn"}`}
                onClick={() => isShoppingList ? addShoppingItem() : addInStockItem()}
            >
                + Add item
            </button>

            <ul className={isShoppingList ? "shopping-list" : "in-stock-list"}>
                {
                    listItems.map(item => <Item
                        editItem={() => edit(listViewed, "Editing", item.itemName, item.quantity, item.units, item._id)}
                        updateItemIsToGet={updateItemIsToGet}
                        updateItemQuantity={updateItemQuantity}
                        id={item._id} isToGet={item.isToGet}
                        key={item._id} name={item.itemName}
                        quantity={item.quantity}
                        units={item.units}
                    />)
                }
            </ul>

        </div>
    )
}

export default ShoppingListPage
