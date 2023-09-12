import React, { useEffect, useRef, useState } from 'react'
import Item from '../../Components/Item'
import './style.css'

// TODO: unify functions addShoppingItem and addInStockItem for add item button onclick func

function ShoppingListPage({ filterSearchTerm, setFilterSearchTerm, newItemNameRef, showDeletePopup, listViewed, updateItemQuantity, updateItemIsToGet, toGetItems, inStockItems, refreshList, addShoppingItem, addInStockItem, edit }) {

    useEffect(() => {
        refreshList()
    }, [])

    const isShoppingList = (listViewed === "Shopping List")
    let listItems = isShoppingList ? toGetItems : inStockItems

    const filteredList = (list) => {
        const newList = list.filter(item => item.itemName.toLowerCase().includes(filterSearchTerm.toLowerCase()))
        return newList
    }

    return (
        <div className="page">

            <h1 className="title">{listViewed}</h1>

            <div className="add-item-section">

                {/* TODO: Lift newItemNameRef to app and empty once closing edit popup */}
                <input
                    ref={newItemNameRef}
                    type="text"
                    className="add-item-name-input"
                    onChange={(e) => setFilterSearchTerm(e.target.value)}
                />

                <button

                    className={`add-item-btn ${isShoppingList ? "add-shopping-item-btn" : "add-in-stock-item-btn"}`}
                    onClick={() => {
                        const name = newItemNameRef.current.value
                        if (newItemNameRef.current.value !== '') {
                            isShoppingList ? addShoppingItem(name) : addInStockItem(name)
                        }
                    }}
                >
                    + Add item
                </button>

            </div>


            <ul className={isShoppingList ? "shopping-list" : "in-stock-list"}>
                {
                    filteredList(listItems).map(item => <Item
                        showDeletePopup={showDeletePopup}
                        editItem={() => edit(listViewed, "Editing", item.itemName, item.quantity, item.units, item._id)}
                        updateItemIsToGet={updateItemIsToGet}
                        updateItemQuantity={updateItemQuantity}
                        id={item._id}
                        isToGet={item.isToGet}
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
